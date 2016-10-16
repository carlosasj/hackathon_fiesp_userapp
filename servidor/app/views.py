from datetime import datetime, timedelta
import json

import hashlib
import time

from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from google.transit.gtfs_realtime_pb2 import (
    FeedEntity,
    FeedHeader,
    FeedMessage,
    Position,
    TripDescriptor,
    VehiclePosition,
)

FEED_FILE = 'feed-file.pb'

def feed(request):
    with open(FEED_FILE, 'rb') as feed_file:
        proto_buf = feed_file.read()

    return HttpResponse(proto_buf, content_type='application/octet-stream')

@csrf_exempt
def transit_update(request):
    data = json.loads(request.body.decode('utf-8'))

    try:
        with open(FEED_FILE, 'rb') as feed_file:
            feed_message = FeedMessage.FromString(feed_file.read())
    except IOError:
        feed_header = FeedHeader(
            gtfs_realtime_version='1.0',
            incrementality='FULL_DATASET',
            timestamp=int(time.time()),
        )

        feed_message = FeedMessage(
            header=feed_header,
            entity=[],
        )

    message_hash = hashlib.sha256()
    for key in sorted(data.keys()):
        message_hash.update(str(data[key]))

    position = Position(
        latitude=float(data['px']),
        longitude=float(data['py']),
    )

    trip_descriptor = TripDescriptor(
        trip_id=data['tripid'],
    )

    vehicle_position = VehiclePosition(
        trip=trip_descriptor,
        position=position,
        timestamp=int(data['ts']) // 1000,
    )

    feed_entity = FeedEntity(
        id=message_hash.hexdigest(),
        vehicle=vehicle_position,
    )

    feed_message.header.timestamp = int(time.time())
    feed_message.entity.extend([feed_entity])

    to_remove = []
    old_enough = datetime.now() - timedelta(minutes=30)

    for item in feed_message.entity:
        try:
            when = datetime.fromtimestamp(item.vehicle.timestamp)
        except ValueError:
            when = datetime.fromtimestamp(item.vehicle.timestamp // 1000)
        if when < old_enough:
            to_remove.append(item)

    for item in to_remove:
        feed_message.entity.remove(item)

    with open(FEED_FILE, 'wb') as feed_file:
        feed_file.write(feed_message.SerializeToString())

    return HttpResponse(feed_message.SerializeToString(), content_type='application/octet-stream')

def bus_position(request):
    with open(FEED_FILE, 'rb') as feed_file:
        feed_message = FeedMessage.FromString(feed_file.read())

    latest = 0
    coords = None, None
    for msg in feed_message.entity:
        if msg.vehicle.timestamp > latest:
            latest = msg.vehicle.timestamp
            coords = msg.vehicle.position.latitude, msg.vehicle.position.longitude


    response = HttpResponse(','.join([str(x) for x in coords]), content_type='text/plain')
    response['Access-Control-Allow-Origin'] = '*'

    return response
    
