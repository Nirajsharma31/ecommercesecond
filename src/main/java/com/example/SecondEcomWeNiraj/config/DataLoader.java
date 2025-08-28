package com.example.SecondEcomWeNiraj.config;

import com.example.SecondEcomWeNiraj.entity.User;
import com.example.SecondEcomWeNiraj.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final UserService userService;

    @Autowired
    public DataLoader(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if it doesn't exist
        if (!userService.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@eshop.com");
            admin.setPassword("admin123"); // In production, this should be hashed
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(User.Role.ADMIN);
            admin.setEnabled(true);
            
            userService.saveUser(admin);
            System.out.println("Default admin user created: admin/admin123");
        }

        // Create default regular user if it doesn't exist
        if (!userService.existsByUsername("john")) {
            User user = new User();
            user.setUsername("john");
            user.setEmail("john@example.com");
            user.setPassword("john123"); // In production, this should be hashed
            user.setFirstName("John");
            user.setLastName("Doe");
            user.setRole(User.Role.USER);
            user.setEnabled(true);
            
            userService.saveUser(user);
            System.out.println("Default user created: john/john123");
        }
    }
}