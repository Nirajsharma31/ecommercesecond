package com.example.SecondEcomWeNiraj.controller;

import com.example.SecondEcomWeNiraj.entity.User;
import com.example.SecondEcomWeNiraj.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String firstName = request.get("firstName");
            String lastName = request.get("lastName");

            // Basic validation
            if (username == null || email == null || password == null || firstName == null || lastName == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "All fields are required");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if user already exists
            if (userService.existsByUsername(username)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(error);
            }

            if (userService.existsByEmail(email)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email already exists");
                return ResponseEntity.badRequest().body(error);
            }

            // Create new user
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password); // In production, this should be hashed
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(User.Role.USER);
            user.setEnabled(true);

            User savedUser = userService.saveUser(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", createUserResponse(savedUser));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            if (username == null || password == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Username and password are required");
                return ResponseEntity.badRequest().body(error);
            }

            // Find user by username or email
            Optional<User> userOpt = userService.getUserByUsername(username);
            if (userOpt.isEmpty()) {
                userOpt = userService.getUserByEmail(username);
            }

            if (userOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid username or password");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userOpt.get();

            // Check password (in production, this should use proper password hashing)
            if (!user.getPassword().equals(password)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid username or password");
                return ResponseEntity.badRequest().body(error);
            }

            if (!user.isEnabled()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Account is disabled");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", "jwt-token-" + user.getId()); // Simple token for demo
            response.put("user", createUserResponse(user));
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    // Helper method to create user response without sensitive data
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("role", user.getRole().toString());
        userResponse.put("enabled", user.isEnabled());
        return userResponse;
    }
}