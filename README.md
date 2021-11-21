# DormView

Not all schools provide photos of their dorm rooms, and it can be difficult for students to know what to bring or how to prepare when they don't know what their room is going to look like. Our goal is to make this process easier, as well as allow students to show off their cool dorm designs!

### Visit the [DormView Website](https://dormviewapp.com) to download the app on iOS and Android!

---

## Technical Details

This is just a brief overview, see [About This Project](#about-this-project) below.

### Front End

- React Native Bare Workflow
- JavaScript/TypeScript

### Back End

- Supabase
  - PostgreSQL 13
  - AWS Cloud Storage
  - GoTrue Auth
- Google Firebase
  - Cloud Functions
  - Cloud Messaging (push notifications)

---

## About This Project

This project started in March 2021 as something fun to do at school during COVID-19 restrictions. I wanted some personal experience to put on my resume, but I also wanted to make something that could be useful for college students. I ended up coming up with this idea, and I'm really happy with how it turned out.

I started out with little to no JavaScript/TypeScript or React knowledge, so it took me a while to get used to coding in a new language. Many tutorials later, I had a few working features, and it was time to decide how to structure the app. I wanted to make it as simple as possible, for both me and users, so I decided on a system where users could search for their school, and if the app didn't have it, allow them to request it. Same goes for dorms. For photos, users first navigate to their dorm building, and then can either add a photo to the building in general or add it to a specific room. To allow for content moderation, any requested items are marked as "pending" and must be approved by me or another moderator. While a school or dorm is pending, however, users can still add to it.

Once I had a working app, I worked on separating out the visual components and finalizing the UI design. Once most of the main screens were done, I transitioned to figuring out how to set up the backend for storing user photos and school/dorm data.

The project originally started out being hosted on Google Firebase, as I have had experience with it in the past for various smaller projects. However, as the project progressed I realized that a NoSQL database was not the correct structure for the type of data I had. My data, schools, dorms, and photos, was very relational, each dorm had photos, each school had dorms, each user owned photos, and so on. Keeping this in Firebase would have led to very high usage charges for reading and querying separate documents for each of these individual items.

I began looking around for a way to store my data in a relational SQL database. From what I could find, many cloud-hosted options seemed complicated and expensive, and for this project I wanted to focus mostly on frontend development. I eventually stumbled across Supabase, an online hosted PostgreSQL database with very reasonable pricing. I decided to try it out, and it ended up working out quite well for me.

As someone at the time with almost no SQL experience, setting up a database and making tables was extremely easy. As I began to become more comfortable, I really liked how Supabase allows you to write SQL code and have full control of your database if desired. This allowed me to set up row level security rules and create triggers to send users notifications when their photos are approved. I also decided to use Supabase for file storage (for user photos) as well, since it would integrate with the database and allow me to link photo table entries with links to photo files, as well as set up security rules for accessing photos. Supabase also provided a simple authentication api which integrated with the SQL database as well.

This isn't an ad for Supabase by the way, I just think they're really cool and you should [check them out](https://supabase.com) :)

For push notifications, I stuck with Firebase Cloud Messaging as it was free and easy to set up. I simply send a POST request from the Supabase database to a Firebase Cloud Function that sends a notification whenever a school/dorm/photo is approved.

Finally, I added in Google AdMob and Google Analytics to serve ads in the app to monetize it and provide a way for me to keep track of its progress. Monetezation was not a main goal for this project whatsoever, but I figured it couldn't hurt. I tried to place ads in as non-instrusive of a way as possible.
