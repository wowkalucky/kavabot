# Create Slack app to provide Friday's LEAN COFFEE functionality to RaccoonGang #lectorium Slack channel.

## Initial decisions:

### Distribution:
- internal integration;
- shared app (SSL);

### Tech stack: alternatives
- **node! | NEDB | [node-slack-sdk](https://github.com/slackapi/node-slack-sdk)**
- python? | SQL ? | slackclient

### Tools:
- slash commands;
- dialogs;
- message buttons;
- message threads;
- incoming webhooks;
- permalinks;

### Slack APIs:
- Events API - the new one: subscription model (user activities);
- RealTimeMessages API - full activities stream! (web-sockets);
- Web API (events, messages, channels, user groups, files, attachments, reactions);
    - buttons;
    - attachments...

## Architecture:

### Glossary
- Discussion - Lean Coffee meeting (date, participants count)
- Topic - question to discuss;
	- title;
	- description (1-2 sentenses);
	- category (hot=70%+, cool=40%+);
- Vote - ability of participants to vote for interested Topic (vote_count=2, secret_mode?)
- Archive - already discussed Topics (date, results?);
- Backlog - cumulative not discussed Topics from previous Discussions;
- Agenda - count of top-voted Topics (agenda_scope);

### Roles [TODO]:
- Administrator:
    - full control;
- Moderator:
    - organization activities;
- Participant:
    - passive user;

### General defaults:
- quorum: 5; [TODO]
- votes_count: 2;
- agenda_scope: 3;
- deadline: 60 min; [TODO]

- topic_categories: cool, hot
- anonym_voting: true;  [TODO]
- anonym_proposal: false;   [TODO]
- send_notifications: true; [TODO]

### Flow (Status):
- TODO [idle] - to discuss (Backlog);
- IN PROGRESS [active] - in discussing;
- DONE [archived] - discussed (Archive);


## DEV PLAN

### Features:

-1) ~~Get familiar with Slack tools;~~

0) ~~Define core data model;~~

1) ~~Creating~~ (removing, closing) Discussion;

2) ~~Adding~~ (editing, removing) Topics to Discussion;

3) ~~Voting (revoking) for Topics;~~

4) ~~Agenda announcement~~ (voting closing and publishing) (auto);

    - Agenda => [Topic#1, Topic#2, Topic#3]

5) ~~Moving Topics within the Flow~~;

6) Metrics: (?)

- participants count;
- user activity (proposed topics | ~~interesing/hot~~);
- activity rating;

7) ~~Adding Topics to Backlog;~~

8) ~~Adding Topic to Archive;~~

9) Tags: (?)

10) Notifications:

- Discussion invitation (participation confirm + current settings + Backlog ref);
- new Topic added;
- defined Agenda (~~manual~~, deadline);
- Discussion history | summary (links to video, photo, text);
