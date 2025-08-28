package com.example.SecondEcomWeNiraj.controller;

import com.example.SecondEcomWeNiraj.entity.Category;
import com.example.SecondEcomWeNiraj.entity.Product;
import com.example.SecondEcomWeNiraj.service.ProductService;
import com.example.SecondEcomWeNiraj.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    
    // Directory to store uploaded images
    private final String UPLOAD_DIR = "src/main/resources/static/images/products/";

    @Autowired
    public AdminController(ProductService productService, CategoryService categoryService) {
        this.productService = productService;
        this.categoryService = categoryService;
        
        // Create upload directory if it doesn't exist
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, String>> getDashboard() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Admin dashboard endpoint - Implementation pending");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            // Find category
            Category category = categoryService.getCategoryById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            
            // Handle image upload
            String imageUrl = null;
            if (image != null && !image.isEmpty()) {
                imageUrl = saveImage(image);
            }
            
            // Create product
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setPrice(BigDecimal.valueOf(price));
            product.setStockQuantity(stockQuantity);
            product.setCategory(category);
            product.setBrand(brand);
            product.setImageUrl(imageUrl);
            product.setActive(true);
            
            Product savedProduct = productService.saveProduct(product);
            
            return ResponseEntity.ok(savedProduct);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Update product endpoint - Implementation pending");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Delete product endpoint - Implementation pending");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description) {
        
        try {
            // Check if category already exists
            if (categoryService.existsByName(name)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Category with this name already exists");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Create category
            Category category = new Category();
            category.setName(name);
            category.setDescription(description);
            
            Category savedCategory = categoryService.saveCategory(category);
            
            return ResponseEntity.ok(savedCategory);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private String saveImage(MultipartFile image) throws IOException {
        // Generate unique filename
        String originalFilename = image.getOriginalFilename();
        String extension = originalFilename != null ? 
            originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path targetPath = Paths.get(UPLOAD_DIR + filename);
        Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return relative URL for frontend
        return "/images/products/" + filename;
    }
   @DeleteMapping("/delete-all-products")
    public ResponseEntity<Map<String, Object>> deleteAllProducts() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get all products before deletion for counting
            var allProducts = productService.getAllProducts();
            int totalProducts = allProducts.size();
            
            if (totalProducts == 0) {
                response.put("success", true);
                response.put("message", "No products found to delete");
                response.put("deletedCount", 0);
                return ResponseEntity.ok(response);
            }
            
            // Count products by category before deletion
            Map<String, Integer> categoryCount = new HashMap<>();
            for (Product product : allProducts) {
                String categoryName = product.getCategory() != null ? 
                    product.getCategory().getName() : "Uncategorized";
                categoryCount.put(categoryName, categoryCount.getOrDefault(categoryName, 0) + 1);
            }
            
            // Delete all products
            for (Product product : allProducts) {
                try {
                    productService.deleteProduct(product.getId());
                    System.out.println("Deleted product: " + product.getName());
                } catch (Exception e) {
                    System.err.println("Error deleting product " + product.getName() + ": " + e.getMessage());
                }
            }
            
            response.put("success", true);
            response.put("message", "All products deleted successfully");
            response.put("deletedCount", totalProducts);
            response.put("categoryBreakdown", categoryCount);
            
            System.out.println("Successfully deleted " + totalProducts + " products");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting products: " + e.getMessage());
            response.put("deletedCount", 0);
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/delete-products-by-category/{categoryId}")
    public ResponseEntity<Map<String, Object>> deleteProductsByCategory(@PathVariable Long categoryId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get category
            var categoryOpt = categoryService.getCategoryById(categoryId);
            if (categoryOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Category not found");
                return ResponseEntity.ok(response);
            }
            
            Category category = categoryOpt.get();
            var products = productService.getProductsByCategory(categoryId);
            int deletedCount = 0;
            
            for (Product product : products) {
                try {
                    productService.deleteProduct(product.getId());
                    deletedCount++;
                    System.out.println("Deleted product: " + product.getName() + " from " + category.getName());
                } catch (Exception e) {
                    System.err.println("Error deleting product " + product.getName() + ": " + e.getMessage());
                }
            }
            
            response.put("success", true);
            response.put("message", "Deleted " + deletedCount + " products from " + category.getName());
            response.put("deletedCount", deletedCount);
            response.put("categoryName", category.getName());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting products: " + e.getMessage());
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/products-count")
    public ResponseEntity<Map<String, Object>> getProductsCount() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var allProducts = productService.getAllProducts();
            var categories = categoryService.getAllCategories();
            
            Map<String, Integer> categoryCount = new HashMap<>();
            int totalProducts = allProducts.size();
            
            // Count products by category
            for (Category category : categories) {
                int count = productService.getProductsByCategory(category.getId()).size();
                categoryCount.put(category.getName(), count);
            }
            
            response.put("success", true);
            response.put("totalProducts", totalProducts);
            response.put("categoryCount", categoryCount);
            response.put("totalCategories", categories.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting product count: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/debug-products")
    public ResponseEntity<Map<String, Object>> debugProducts() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var allProducts = productService.getAllProducts();
            
            // Create debug info for each product
            var productDebugInfo = allProducts.stream().map(product -> {
                Map<String, Object> productInfo = new HashMap<>();
                productInfo.put("id", product.getId());
                productInfo.put("name", product.getName());
                productInfo.put("imageUrl", product.getImageUrl());
                productInfo.put("hasImage", product.getImageUrl() != null && !product.getImageUrl().isEmpty());
                productInfo.put("isPlaceholder", product.getImageUrl() != null && product.getImageUrl().contains("placeholder"));
                return productInfo;
            }).toList();
            
            response.put("success", true);
            response.put("products", productDebugInfo);
            response.put("totalProducts", allProducts.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting debug info: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/fix-product-images")
    public ResponseEntity<Map<String, Object>> fixProductImages() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var allProducts = productService.getAllProducts();
            int fixedCount = 0;
            
            for (Product product : allProducts) {
                boolean needsUpdate = false;
                
                // Fix products with placeholder URLs or null images
                if (product.getImageUrl() == null || 
                    product.getImageUrl().isEmpty() || 
                    product.getImageUrl().contains("placeholder") ||
                    product.getImageUrl().contains("via.placeholder.com")) {
                    
                    // Set to null so frontend will use its own placeholder
                    product.setImageUrl(null);
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    productService.saveProduct(product);
                    fixedCount++;
                    System.out.println("Fixed image URL for product: " + product.getName());
                }
            }
            
            response.put("success", true);
            response.put("message", "Fixed image URLs for " + fixedCount + " products");
            response.put("fixedCount", fixedCount);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fixing product images: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    }
    