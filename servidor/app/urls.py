from django.conf.urls import url, include

from app.views import feed, transit_update, bus_position

urlpatterns = [
    url(r'^feed/$', feed),
    url(r'^transit-update/$', transit_update),
    url(r'^bus-position/$', bus_position),
]
