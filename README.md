
# upshot

![alt text](https://upshot-its.web.app/assets/img/arrow.png)


**_noun_**  

the final or eventual outcome or conclusion of a discussion, action, or series of events.


## What is upshot?


Upshot is an Issue Tracking System for software development teams. It allows users to:  

**Create projects**, which will serve as a general category to group issues.  

**Create and keep issues up-to-date**, including attachments and comments from other users.  

**Follow, assign and takeover**, issues created by other users.  

  

**upshot** was developed as a single-page application using React for the front-end and NodeJS/ExpressJS for the back-end. It was developed as a Module 3 project for the Ironhack Coding Bootcamp.


### Models


- User

- Project

- Issue

- Comment


### Backend Routes


- Auth

  - /api/auth/signup

  - /api/auth/login

  - /api/auth/logout


- Users

  - /api/users

  - /api/users/:id

  - /api/users/:id/update

  - /api/users/:id/update-avatar

  - /api/users/:id/remove-avatar


- Projects

  - /api/projects

  - /api/projects/create

  - /api/projects/:id 

  - /api/projects/:id/update

  - /api/projects/:id/delete


- Issues

  - /api/issues

  - /api/issues/create

  - /api/issues/:id

  - /api/issues/:id/comment

  - /api/issues/:id/follow

  - /api/issues/:id/unfollow

  - /api/issues/:id/takeover

  - /api/issues/:id/release

  - /api/issues/:id/assign

  - /api/issues/:id/update

  - /api/issues/:id/delete

  - /api/issues/:id/add-attachment

  - /api/issues/:id/remove-attachment
