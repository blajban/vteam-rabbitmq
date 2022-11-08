# Teknisk studie RabbitMQ

När vi började diskutera arkitektur stod det klart för mig att microservices och eventdriven arkitektur skulle passa bra tillsammans. Samtidigt blev jag lite förskräckt av tanken på att implementera ett event-/message-system från scratch. Tur då att det finns färdiga verktyg man kan använda. Ett av de populäraste är [RabbitMq](https://www.rabbitmq.com/).

## Vad är RabbitMQ?
RabbitMQ beskriver sig som en "message broker": uppgiften är att ta emot och vidarebefordra meddelanden.

Några grundbegrepp:
* **Producer**: en applikation som sänder meddelanden.
* **Queue**: en plats att lagra meddelanden i väntan på leverans.
* **Consumer**: en applikation som tar emot meddelanden.

Det finns också andra begrepp så som en **exchange** vars uppgift är att ta emot meddelanden från producenter och skicka till olika köer.

## Hur fungerar det?
Principen är enkel: en producent (P) skickar ett meddelande till en kö och en konsument (C) tar emot meddelandet.

![Enkel princip](https://www.rabbitmq.com/img/tutorials/python-one.png)

Man kan tänka sig att en producent skickar meddelanden till flera konsumenter ("Work queues")...

![Work Queus](https://www.rabbitmq.com/img/tutorials/python-two.png)

... eller att en producent skickar meddelanden som går itll olika köer via en så kallad exchange (Publish/subscribe):

![Publish/Subscribe](https://www.rabbitmq.com/img/tutorials/python-three-overall.png)

Ett annat exempel är när en klient behöver ett svar från en server. Då finns det ett mönster som kallas Remote Procedure Call (RPC). Här sänder klienten ett meddelande via en kö till servern, när servern ser meddelanden gör den sitt jobb och skickar sedan ett meddelande med resultatet tillbaka till klienten via en reply-kö. Klienten i sin tur väntar med en callback-funktion och kör den när svaret kommer:

![RPC](https://www.rabbitmq.com/img/tutorials/python-six.png)

Det kan naturligtvis bli mer komplext än så här men i denna studie skrapar vi mest på ytan. Jag rekommenderar att gå igenom kom igång-guiderna på hemsidan om man vill veta mer.

En notering är att RabbitMQ är själva meddelandemäklaren, under huven finns olika meddelandeprotokoll som gör det möjligt att skicka meddelandena. Defaultprotokollet kllas AMQP 0-9-1. Jag har inte dykt närmare ner i dessa i denna lilla studie.

## Asynkront
En av de stora fördelarna som jag ser det är det asynkrona. Meddelanden hamnar i kön och stannar där tills någon konsumerar i den takt den hinner. När du startar exemplet nedan kan du märka att kön redan innehåller meddelanden när du drar igång "loggern" - det första som händer är att den börjar konsumera de meddelanden som redan ligger i kön. 

## Kom igång
Det enklaste sättet att köra igång är att använda [den officiella Docker-imagen](https://hub.docker.com/_/rabbitmq).

Klona repot och starta RabbitMQ:
`docker-compose up -d mq`

Nu är RabbitMQ igång och snurrar på port 5672 och du kan börja använda den för dina services.


## Ett enkelt cykel-system
Här är ett väldigt enkelt exempel på ett litet generiskt system med cyklar som rapporterar status. Bara den enklaste funktionaliteten används, att skicka meddelanden till en kö och konsumera dem: 

![Enkel princip](https://www.rabbitmq.com/img/tutorials/python-one.png)

Se längre ner hur man kör hela exemplet.

Tanken är alltså att vi ska starta igång ett gäng cyklar och ha ett litet program som sitter och lyssnar på meddelandena. Bara för att visa potentialen för ett flöde har jag också lagt in en enkel mongodb i exemplet som sparar alla meddelanden. Tänk på att det inte är optimerat på något sätt, bara snabbt fixat för exemplets skull.

Koden är i princip hämtad från kom igång-guiderna. Längre ner ser du hur du kör hela exemplet.

### /bike
Här finns ett enkelt bash-script som använder RabbitMQ:s cli-verktyg för att skicka meddelanden till vår message broker, i det här fallet amqp-publish:
```
amqp-publish -u amqp://mq -r "$QUEUE" -p -C application/json -b "$status"
```

`$QUEUE` är namnet på kön som vi vill använda. `$status` är vårt meddelande.

I Dockerfile installerar vi bash och rabbitmq-c-utils som är namnet på cli-verktyget:
`RUN apk add --no-cache bash && apk add --no-cache rabbitmq-c-utils`

### /logger
Tanken med logger är att den ska lyssna på meddelanden och skriva till databasen. 

Först behövs ett klientbibliotek för att koppla upp oss mot RabbitMQ. Det finns bra guider med flera olika språk på hemsidan (python, javascript, php etc). Här använder jag javascript och klientbiblioteket **amqp.node**.

Allt som har med RabbitMQ att göra finns under funktionen `amqp.connect()`:

```
amqp.connect(mqHost, function(error0, connection) {
    /* code */
});
```

Funktionen skapar upp en kö och går sedan in i `channel.consume()` där den lyssnar på meddelanden, skriver ut dem och kallar på databas-funktionerna:
```
channel.consume(queue, function(msg) {
    console.log(" [x] Received %s", msg.content);
    add_log_msg(msg.content.toJSON()).catch(console.error);
}
```

## Kör exemplet

Klona repot med `git clone`

Sedan:
```
./run bash
cd logger
npm install
node logger.js
```

Köra 200 cyklar? 
```
docker-compose up -d --scale bike=200
```

## Till sist
Det återstår att se om detta är något vi alls kommer använda. Det känns som att den stora fördelen med events/messages är att det är enkelt att koppla in nya funktioner, men det krävs en del tanke för att få alla köer och meddelanden rätt. Det känns också som ett ganska enkelt sätt att hantera kommunikationen mellan microservices jämfört med att göra ett REST API. Jag tror ockå att det asynkrona kan hjälpa till med belastningen, inga meddelanden försvinner utan de olika servicarna kan göra jobbet i den takt de hinner med. Utvärdering pågår! Men oavsett var det kul att dyka ner lite i detta och försöka lära sig lite mer.

**/Erik Sjöberg, grupp 3**
