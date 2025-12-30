# Hero-Builds API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register

Create a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "token": "jwt_token_string" }`

### Login

Authenticate a user and retrieve a token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "token": "jwt_token_string" }`

### Get Current User

Retrieve details of the currently authenticated user.

- **URL**: `/auth/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": 1,
      "email": "user@example.com",
      "isAdmin": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
    ```

---

## Heroes

### Get All Heroes

Retrieve a list of all heroes.

- **URL**: `/heroes`
- **Method**: `GET`
- **Auth Required**: No (Public)
- **Query Params**:
  - `search` (optional): Filter heroes by name.
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    [
      {
        "id": 1,
        "name": "Layla",
        "role": "Marksman",
        "hero_image_path": "/uploads/heroes/layla.png",
        "role_icon_path": "/uploads/roles/marksman.png",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Tigreal",
        "role": "Tank",
        "hero_image_path": "/uploads/heroes/tigreal.png",
        "role_icon_path": "/uploads/roles/tank.png",
        "createdAt": "2023-10-27T10:05:00.000Z",
        "updatedAt": "2023-10-27T10:05:00.000Z"
      }
    ]
    ```

### Create Hero (Admin)

Create a new hero.

- **URL**: `/heroes`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name`: Text
  - `role`: Text
  - `hero_image`: File
  - `role_icon`: File
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": 3,
      "name": "Fanny",
      "role": "Assassin",
      "hero_image_path": "/uploads/heroes/fanny.png",
      "role_icon_path": "/uploads/roles/assassin.png",
      "updatedAt": "2023-10-27T12:00:00.000Z",
      "createdAt": "2023-10-27T12:00:00.000Z"
    }
    ```

### Update Hero (Admin)

Update an existing hero.

- **URL**: `/heroes/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Content-Type**: `multipart/form-data`
- **Body** (all optional):
  - `name`: Text
  - `role`: Text
  - `hero_image`: File
  - `role_icon`: File
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": 1,
      "name": "Layla Updated",
      "role": "Marksman",
      "hero_image_path": "/uploads/heroes/layla_v2.png",
      "role_icon_path": "/uploads/roles/marksman.png",
      "createdAt": "2023-10-27T10:00:00.000Z",
      "updatedAt": "2023-10-28T09:30:00.000Z"
    }
    ```

### Delete Hero (Admin)

Delete a hero.

- **URL**: `/heroes/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "msg": "Hero deleted" }`

### Seed Heroes (Admin)

Populate heroes from an external source.

- **URL**: `/heroes/seed`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "msg": "Seeding started..." }`

### Get Seed Status (Admin)

Check the status of the seeding process.

- **URL**: `/heroes/seed/status`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  - **Code**: 200
  - **Content**: Status object

---

## Builds

### Get Builds for Hero

Retrieve all builds associated with a specific hero.

- **URL**: `/heroes/:heroId/builds`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    [
      {
        "id": 10,
        "user_id": 5,
        "hero_id": 1,
        "title": "Burst Damage",
        "image_path": "/uploads/builds/layla_burst.png",
        "display_order": 1,
        "createdAt": "2023-11-01T14:20:00.000Z",
        "updatedAt": "2023-11-01T14:20:00.000Z"
      },
      {
        "id": 11,
        "user_id": 5,
        "hero_id": 1,
        "title": "Attack Speed",
        "image_path": "/uploads/builds/layla_as.png",
        "display_order": 2,
        "createdAt": "2023-11-02T09:15:00.000Z",
        "updatedAt": "2023-11-02T09:15:00.000Z"
      }
    ]
    ```

### Create Build

Upload a build image for a hero. Maximum 3 builds per hero allowed.

- **URL**: `/heroes/:heroId/builds`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `title` (optional): Text
  - `build_image`: File
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "id": 12,
      "user_id": 5,
      "hero_id": 1,
      "title": "Sustainable Lifesteal",
      "image_path": "/uploads/builds/layla_lifesteal.png",
      "display_order": 3,
      "updatedAt": "2023-11-03T11:00:00.000Z",
      "createdAt": "2023-11-03T11:00:00.000Z"
    }
    ```

### Reorder Builds

Update the order of builds for a hero.

- **URL**: `/heroes/:heroId/builds/reorder`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "buildIds": [3, 1, 2]
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "msg": "Builds reordered" }`

### Delete Build

Delete a specific build.

- **URL**: `/builds/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: 200
  - **Content**: `{ "msg": "Build deleted" }`

---

## AI Coach

### Chat with Coach

Send a message to the AI-powered MLBB Coach.

- **URL**: `/chat`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "message": "My query about the game",
    "context": "Optional context string"
  }
  ```
- **Success Response**:
  - **Code**: 200
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "reply": "The AI's response text..."
      }
    }
    ```

