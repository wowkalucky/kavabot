# Create Slack app to provide Friday's LEAN COFFEE functionality to RaccoonGang #lectorium Slack channel.

## Initial decisions:

### Distribution:
- internal integration;
- shared app (SSL);

### Tech stack: alternatives
- node! | simple DB | [node-slack-sdk](https://github.com/slackapi/node-slack-sdk)
- python? | ? | slackclient

### Tools:
- message buttons;
- incoming webhooks;
- slash commands;
- permalinks;
- message threads;

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

### Roles:
- Administrator:
    - full control;
- Moderator:
    - organization activities;
- Participant:
    - passive user;

### General defaults:
- quorum: 5;
- votes_count: 2;
- agenda_scope: 3;

- topic_categories: [cool, hot]
- secret_voting: true;
- secret_proposal: false;
- send_notifications: true;

### Flow (Status):
- TODO - to discuss (Backlog);
- IN PROGRESS - in discussing;
- DONE - discussed (Archive);

### Features:
1) Creating (removing, closing) Discussion;

    - initDiscussion();
    - closeDiscussion();

2) Adding (editing, removing) Topics to Discussion;

    - Discussion.addTopic();
    - Discussion.editTopic(id);
    - Discussion.removeTopic(id);

3) Voting for Topics;
    - Topic.addVote();
    - Topic.moveVote();

4) Defining (voting closing and publishing) discussion Agenda (auto);

    - Agenda => [Topic#1, Topic#2, Topic#3]

5) Moving Topics within the Flow;

    - Topic.changeStatus(status);

6) Metrics: (?)

    - participants count;
    - user activity (proposed topics | interesing/hot);
    - activity rating;

7) Adding Topics to Backlog;

    - Topic.postpone();

8) Adding Topic to Archive;

    - Topic.archive();

9) Tags: (?)

10) Notifications:

	- Discussion invitation (participation confirm + current settings + Backlog ref);
	- new Topic added;
	- defined Agenda (manual, deadline);
	- Discussion.summary (links to video, photo, text);
