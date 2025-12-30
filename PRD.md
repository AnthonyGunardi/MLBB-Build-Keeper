# Product Requirements Document (PRD): MLBB Build Keeper

| Project Metadata     | Details                               |
| :------------------- | :------------------------------------ |
| **Project Name**     | MLBB Build Keeper                     |
| **Version**          | 1.0.0                                 |
| **Status**           | Approved for Development              |
| **Last Updated**     | December 25, 2025                     |
| **Target Audience**  | Mobile Legends Players (Personal Use) |
| **Deployment Model** | Self-hosted                           |
| **Hosting**          | Linux VPS / Local Server              |

---

## 1. Executive Summary

**MLBB Build Keeper** is a responsive web application that allows Mobile Legends players to store, manage, and publicly showcase hero build images in a structured and constrained manner.

The system emphasizes:

- Image-based build preservation
- Strict constraints (maximum 3 builds per hero)
- Public read-only visibility
- Simple CRUD operations

The product deliberately avoids over-modeling gameplay mechanics and prioritizes visual clarity, speed, and maintainability.

---

## 2. Product Philosophy & Scope Boundaries

### 2.1 Core Philosophy

- Builds are visual references, not structured game data
- Images are the source of truth
- Constraints improve usability
- Public access does not imply public modification
- Simplicity over speculative extensibility

### 2.2 Explicit Non-Goals

- Item-level build parsing
- Patch/version awareness
- Social interactions (likes, comments, follows)
- Analytics or user tracking
- Multi-language support
- Soft deletes or audit logs

---

## 3. Technical Architecture & Stack

### 3.1 High-Level Architecture

Client → API → Database / File System

1. **Frontend (React)**
   - Authentication state handling
   - Upload UI and build ordering
2. **Backend (Express)**
   - Authentication, validation, business rules
   - Image processing and persistence
3. **Storage**
   - MySQL for relational data
   - Local server file system for images

---

### 3.2 Tech Stack

#### Frontend

- React
- CSS Modules
- Axios
- React Router

#### Backend

- Node.js
- Express.js
- Sequelize (ORM)
- MySQL
- Multer (file uploads)
- Sharp (image optimization)
- Google GenAI SDK (Gemini AI)
- JWT + bcrypt
- express-rate-limit

---

## 4. Functional Requirements

### 4.1 Authentication & Access Control

- **REQ-01:** Support user registration and login via email/password
- **REQ-02:** Passwords must be hashed using bcrypt
- **REQ-03:** JWT-based stateless authentication
- **REQ-04:** Only authenticated users may manage builds
- **REQ-05:** All builds must be publicly viewable in read-only mode

---

### 4.2 Hero Management (Admin)

- **REQ-06:** Admin-only hero management
- **REQ-07:** Hero attributes:
  - Name
  - Role
  - Hero image
  - Role icon
- **REQ-08:** Images stored on local server storage
- **REQ-09:** Deleting a hero hard-deletes all related builds and images
- **REQ-09a:** Admins can seed hero data (name, role, images) from the unofficial [Mobile Legends API](https://mlbb-stats.ridwaanhall.com/api) by [ridwaanhall](https://github.com/ridwaanhall/api-mobilelegends).

---

### 4.3 Build Upload & Lifecycle

- **REQ-10:** Users can upload build images per hero
- **REQ-11:** Each build must have a title
- **REQ-12:** Supported formats: JPG, PNG only
- **REQ-13:** Max file size: 2MB
- **REQ-14:** Images must be optimized using Sharp:
  - Resize
  - Compress
  - Strip metadata
- **REQ-15:** Images stored on local file system

---

### 4.4 Build Constraints & Ordering

- **REQ-16:** Maximum 3 builds per hero per user
- **REQ-17:** 4th build attempt must be rejected
- **REQ-18:** Drag-and-drop build reordering supported
- **REQ-19:** Order persisted using `display_order`

---

### 4.5 Build Update & Deletion

- **REQ-20:** Users may update build titles
- **REQ-21:** Users may replace build images
- **REQ-22:** Replacing an image must delete the old file
- **REQ-23:** Users may delete builds
- **REQ-24:** Deletion removes DB record and image file
- **REQ-25:** All deletions are irreversible (hard delete)

---

### 4.6 Public Viewing

- **REQ-26:** Guests can view heroes and builds without authentication
- **REQ-27:** Guests cannot modify any data

---

### 4.7 AI Coach

- **REQ-28:** Integrated AI Chat Assistant using Google Gemini
- **REQ-29:** Provides context-aware advice on builds, counters, and gameplay
- **REQ-30:** Publicly accessible (subject to rate limiting)

---

## 5. Data Models

### 5.1 User

```
id
email
password_hash
created_at
updated_at
```

---

### 5.2 Hero

```
id
name
role
hero_image_path
role_icon_path
created_at
updated_at
```

---

### 5.3 Hero Build

```
id
user_id
hero_id
title
image_path
display_order
created_at
updated_at
```

#### Constraints

- Maximum **3 builds** per `(user_id, hero_id)`
- `display_order` must be **unique per hero per user**

## 6. API Overview

### Authentication

- `POST /auth/register`
- `POST /auth/login`

### Heroes

- `GET /heroes`
- `POST /heroes` (admin only)
- `DELETE /heroes/:id` (admin only)

### Builds

- `GET /heroes/:heroId/builds`
- `POST /heroes/:heroId/builds`
- `PUT /builds/:id`
- `PUT /builds/reorder`
- `DELETE /builds/:id`

### AI Coach

- `POST /chat`

---

## 7. UI / UX Guidelines

- Mobile-first, responsive layout
- Clear distinction between editable and read-only states
- Upload progress and validation feedback
- Confirmation required for destructive actions
- Drag-and-drop reordering supports touch and mouse

---

## 8. Security, Performance & Reliability

| Area             | Requirement                               |
| ---------------- | ----------------------------------------- |
| Transport        | HTTPS enforced                            |
| Authentication   | JWT validation on protected routes        |
| Rate Limiting    | Login and upload endpoints                |
| File Validation  | MIME type and extension checks            |
| Image Processing | Sharp optimization and metadata stripping |
| Cleanup          | No orphaned files allowed                 |

---

## 9. Risk Assessment & Mitigation

| Risk                | Severity | Mitigation                    |
| ------------------- | -------- | ----------------------------- |
| Image storage bloat | Medium   | Hard delete and size limits   |
| Upload abuse        | Medium   | Rate limiting                 |
| UX clutter          | Low      | Enforced 3-build limit        |
| Overengineering     | High     | Avoid semantic build modeling |

---

## 10. Roadmap

1. Authentication and hero management
2. Build upload and image optimization
3. Reorder and delete functionality
4. Public read-only views
5. Responsive UI polish
6. Gemini AI integration
7. Security improvements
