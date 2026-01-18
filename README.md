# Reservation App - Frontend

A modern, responsive web application for managing restaurant reservations. Built for **Customers** to book tables and **Restaurant Owners** to manage their stores.

> **TIP**  
> To quickly run the entire application, please refer to the **Quick connect** section at the end of the backend documentation.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Key Libraries & Decisions](#key-libraries--decisions)
- [Data Flow](#data-flow)
- [User Paths](#user-paths)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Error Handling](#error-handling)

## Tech Stack
*   **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Routing**: [React Router DOM](https://reactrouter.com/)
*   **State Management**: [TanStack Query](https://tanstack.com/query/latest) (Server) + [Context API](https://react.dev/reference/react/createContext) (Client)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/) + [Lucide React](https://lucide.dev/) (Icons)
*   **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
*   **Utilities**: [Date-fns](https://date-fns.org/) + [Sonner](https://sonner.emilkowal.ski/) (Toasts)
*   **HTTP Client**: Native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
*   **Development Environment**:
    *   **IDE**: [VS Code](https://code.visualstudio.com/) + [Antigravity](https://antigravity.google/)
    *   **AI Assistants**: [Gemini 3 Pro](https://gemini.google.com/), [GitHub Copilot](https://github.com/features/copilot), [ChatGPT 5](https://chatgpt.com/)

## Key Libraries & Decisions
*   **[Shadcn/UI](https://ui.shadcn.com/)**: Chosen for its accessibility and copy-paste architecture, allowing full control over component code unlike traditional component libraries.
*   **[TanStack Query](https://tanstack.com/query/latest)**: Selected to manage server state (caching, loading states) independently of UI state, reducing boilerplate `useEffect` code.
*   **[Zod](https://zod.dev/)**: Used for runtime schema validation, ensuring that form data matches backend expectations before submission.

## Data Flow
The application relies on **TanStack Query (React Query)** to handle all server-side state. This generally replaces the need for strict `useEffect` fetching.

1.  **Queries** (`useQuery`): Data is fetched, cached, and automatically kept fresh.
    *   *Example*: `useUnownedRestaurantsQuery` caches the list of unowned restaurants for 5 minutes.
2.  **Mutations** (`useMutation`): Used for CREATE/UPDATE/DELETE operations.
    *   *Example*: `useCancelReservationMutation` sends a DELETE request.
3.  **Invalidation**: Upon successful mutation, related queries are invalidated to trigger an automatic refetch.
    *   *Example*: Canceling a reservation invalidates the `['my-reservations']` key, causing the UI to update immediately without a page reload.

## User Paths

### 1. Customer Flow
*   **Signup**: Create an account as a "Customer".
*   **Browse**: View list of available restaurants.
*   **Reserve**: Click "Book Table", select Date/Time/People.
*   **Manage**: View "My Reservations" to see previous or cancel upcoming bookings.

### 2. Owner Flow
*   **Signup**: Create an account as "Owner" by **claiming** an unowned restaurant.
*   **Dashboard**: View a real-time list of "Active" and "History" reservations.
*   **Manage**: Mark passed reservations as "Completed" (Checked-in) or "No-show".

## Project Structure
```
src/
├── features/             # Feature-based architecture
│   ├── auth/             # Login, Signup, AuthContext
│   ├── reservations/     # Booking logic, History, Owner Dashboard
│   └── restaurants/      # Restaurant listing and details
├── app/                  # Routes, providers, tanstack query
├── components/           # Shared UI components (Button, Cards, Forms)
├── lib/                  # Utilities (fetch wrapper, utils)
└── layouts/              # App shells (Navbar, Footer)
```

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```
    
2.  **Environment Variables**
    Create a `.env` file in the root with the following variables:
    ```env
    VITE_API_URL=
    PORT=
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:{PORT}`

## Error Handling
*   **Global Layout**: `apiFetch` normalizes backend errors.
*   **Forms**: Field-level validation messages powered by Zod schema inference.
*   **Toasts**: `sonner` is used for success/error notifications (e.g., "Reservation Confirmed", "Failed to login").
