# Teknisk studie RabbitMQ

När vi började diskutera arkitektur stod det klart för mig att microservices och eventdriven arkitektur skulle passa bra tillsammans. Samtidigt blev jag lite förskräckt av tanken på att implementera ett event-/message-system från scratch. Tur då att det finns färdiga verktyg man kan använda. Ett av de populäraste är RabbitMQ:

[RabbitMq](https://www.rabbitmq.com/).

Studien utgår från tutorialsen som finns på hemsidan och all kod finns samlad i repot.

## Vad är RabbitMQ?
RabbitMQ beskriver sig som en "message broker": uppgiften är att ta emot och vidarebefordra meddelanden.

Några grundbegrepp:
* **Producer**: en applikation som sänder meddelanden.
* **Queue**: en plats att lagra meddelanden i väntan på leverans.
* **Consumer**: en applikation som tar emot meddelanden.

Det finns också andra begrepp så som en **exchange** vars uppgift är att ta emot meddelanden från producenter och skicka till olika köer.

Principen är enkel:

![Enkel princip](https://www.rabbitmq.com/img/tutorials/python-one.png)