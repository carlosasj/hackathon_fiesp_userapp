

/*
Exemplo básico de conexão a Konker Plataform via MQTT, baseado no https://github.com/knolleary/pubsubclient/blob/master/examples/mqtt_auth/mqtt_auth.ino. Este exemplo se utiliza das bibliotecas do ESP8266 programado via Arduino IDE (https://github.com/esp8266/Arduino) e a biblioteca PubSubClient que pode ser obtida em: https://github.com/knolleary/pubsubclient/
*/


#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#include <string.h>

// Vamos primeiramente conectar o ESP8266 com a rede Wireless (mude os parâmetros abaixo para sua rede).

const char* ssid = "SuperRedeXoFlango";
const char* password = "missaglia";

//Criando a função de callback
void callback(char* topic, byte* payload, unsigned int length) {
  // Essa função trata das mensagens que são recebidas no tópico no qual o Arduino esta inscrito.
}

//Criando os objetos de conexão com a rede e com o servidor MQTT.
WiFiClient espClient;
PubSubClient client("mqtt.hackathon.konkerlabs.net", 1883, callback,espClient);
ADC_MODE(ADC_VCC);
char mensagemB[150];
int pos;
//char mensagemC[2000];
//void scannets(){
//  
//  int networksFound = WiFi.scanNetworks();
//  int count = 0;
//  count += sprintf(mensagemC+count,"{\"homeMobileCountryCode\":\"724\",\"wifiAccessPoints\": [");
//  for (int i = 0; i < networksFound; i++){
//    count += sprintf(mensagemC+count,"{\"macAddress\":\"%x:%x:%x:%x:%x:%x\",\"signalStrength\":\"%d\",\"channel\":\"%d\"}",
//      WiFi.BSSID(i)[0], WiFi.BSSID(i)[1], WiFi.BSSID(i)[2], WiFi.BSSID(i)[3], WiFi.BSSID(i)[4], WiFi.BSSID(i)[5], 
//      WiFi.RSSI(i), 
//      WiFi.channel(i)
//    );
//    mensagemC[count++] = ((i + 1 == networksFound) ? ']' : ',' );
//  }
//  count += sprintf(mensagemC+count,"}");
//  Serial.println(mensagemC);
//}
void send(){
    if(pos == 0){
      sprintf(mensagemB, "{\"id\":\"02\",\"px\":\"-23.561840\",\"py\":\"-46.656202\",\"tripid\":\"CT01-1-0\"}");//-23.561840, -46.656202
    } else {
      sprintf(mensagemB, "{\"id\":\"02\",\"px\":\"-23.566611299999998\",\"py\":\"-46.6484053\",\"tripid\":\"CT01-1-0\"}");
    }
    
    Serial.println(mensagemB);
    client.publish("pub/uracr6se3fn6/pos",mensagemB);
}
void setup()
{
    //Conectando na Rede
    pinMode(D0, OUTPUT);
    pinMode(D1, INPUT);
    pinMode(D2, INPUT);
    digitalWrite(D0,0);
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    Serial.println("Connecting");
    int i = 0;
    while (WiFi.status() != WL_CONNECTED){
      delay(500);
      Serial.printf("Connection status: %d\n", WiFi.status());
      if(i++ > 15){
        WiFi.begin(ssid, password);
        i = 0;
      }
    }
    digitalWrite(D0,1);

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    
    //Configurando a conexão com o servidor MQTT
    if (client.connect("arduinoClient", "uracr6se3fn6", "SQJoJiXtph5a")) {
      Serial.println("Conectado");
    } else {
      Serial.println("Nao conectado");
    }
    pos = 0;
    
}
void readbtn(){
  int p0, p1;
  p0 = digitalRead(D1);
  p1 = digitalRead(D2);
//  Serial.printf("%d %d\n",p0, p1);
  if (p0 == 0 || p1 == 0){
    if(p0 == 0){
      pos = 0;
    } else if(p1 == 0){
      pos = 1;
    }
  }
}
void loop()
{
  for(int i = 0; i < 1000; i++){
    readbtn();
    delay(1);
  };
  if(client.connect("arduinoClient", "uracr6se3fn6", "SQJoJiXtph5a")){
    send();    
    client.loop();
  } 
}
