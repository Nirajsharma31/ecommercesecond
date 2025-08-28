package com.example.SecondEcomWeNiraj.config;

import com.example.SecondEcomWeNiraj.entity.Category;
import com.example.SecondEcomWeNiraj.entity.Product;
import com.example.SecondEcomWeNiraj.service.CategoryService;
import com.example.SecondEcomWeNiraj.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryService categoryService;
    private final ProductService productService;

    @Autowired
    public DataInitializer(CategoryService categoryService, ProductService productService) {
        this.categoryService = categoryService;
        this.productService = productService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Data initialization disabled - use admin panel or API endpoints to create categories and products
        System.out.println("DataInitializer: Data initialization is disabled.");
        System.out.println("To create categories and products, use the admin panel or API endpoints.");
    }




}