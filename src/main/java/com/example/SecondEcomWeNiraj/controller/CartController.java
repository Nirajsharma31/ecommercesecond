package com.example.SecondEcomWeNiraj.controller;

import com.example.SecondEcomWeNiraj.entity.Cart;
import com.example.SecondEcomWeNiraj.entity.CartItem;
import com.example.SecondEcomWeNiraj.entity.Product;
import com.example.SecondEcomWeNiraj.entity.User;
import com.example.SecondEcomWeNiraj.service.CartService;
import com.example.SecondEcomWeNiraj.service.ProductService;
import com.example.SecondEcomWeNiraj.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;
    private final ProductService productService;
    private final UserService userService;

    @Autowired
    public CartController(CartService cartService, ProductService productService, UserService userService) {
        this.cartService = cartService;
        this.productService = productService;
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            Optional<Cart> cartOpt = cartService.getCartByUserId(userId);
            
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                return ResponseEntity.ok(cart);
            } else {
                // Return empty cart structure
                Map<String, Object> emptyCart = new HashMap<>();
                emptyCart.put("id", null);
                emptyCart.put("cartItems", new ArrayList<>());
                return ResponseEntity.ok(emptyCart);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get cart: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("Adding to cart: " + request);
            
            Long userId = Long.valueOf(request.get("userId").toString());
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());

            System.out.println("User ID: " + userId + ", Product ID: " + productId + ", Quantity: " + quantity);

            // Get or create user
            Optional<User> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                System.out.println("User not found: " + userId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "User not found");
                return ResponseEntity.badRequest().body(error);
            }
            User user = userOpt.get();
            System.out.println("Found user: " + user.getUsername());

            // Get product
            Optional<Product> productOpt = productService.getProductById(productId);
            if (productOpt.isEmpty()) {
                System.out.println("Product not found: " + productId);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Product not found");
                return ResponseEntity.badRequest().body(error);
            }
            Product product = productOpt.get();
            System.out.println("Found product: " + product.getName());

            // Get or create cart
            Optional<Cart> cartOpt = cartService.getCartByUserId(userId);
            Cart cart;
            if (cartOpt.isPresent()) {
                cart = cartOpt.get();
                System.out.println("Found existing cart: " + cart.getId());
                // Initialize cartItems if null
                if (cart.getCartItems() == null) {
                    cart.setCartItems(new ArrayList<>());
                    System.out.println("Initialized empty cart items list");
                }
            } else {
                System.out.println("Creating new cart for user: " + userId);
                cart = new Cart();
                cart.setUser(user);
                cart.setCartItems(new ArrayList<>());
                // Save the cart first to get an ID
                cart = cartService.saveCart(cart);
                System.out.println("Created new cart with ID: " + cart.getId());
            }

            // Check if product already exists in cart
            Optional<CartItem> existingItem = cart.getCartItems().stream()
                    .filter(item -> item.getProduct().getId().equals(productId))
                    .findFirst();

            if (existingItem.isPresent()) {
                // Update quantity
                CartItem item = existingItem.get();
                int oldQuantity = item.getQuantity();
                item.setQuantity(item.getQuantity() + quantity);
                System.out.println("Updated existing item quantity from " + oldQuantity + " to " + item.getQuantity());
            } else {
                // Add new item
                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                cart.getCartItems().add(newItem);
                System.out.println("Added new item to cart: " + product.getName() + " (qty: " + quantity + ")");
            }

            // Save the cart with all items
            Cart savedCart = cartService.saveCart(cart);
            System.out.println("Saved cart successfully. Cart items count: " + savedCart.getCartItems().size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product added to cart");
            response.put("cart", savedCart);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error adding to cart: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add to cart: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long itemId, @RequestBody Map<String, Integer> request) {
        try {
            Integer newQuantity = request.get("quantity");
            
            if (newQuantity == null || newQuantity < 1) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid quantity");
                return ResponseEntity.badRequest().body(error);
            }

            // This would require a CartItemService to update individual items
            // For now, return a placeholder response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Update cart item - Implementation needs CartItemService");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update cart item: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/remove/{userId}/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            Optional<Cart> cartOpt = cartService.getCartByUserId(userId);
            
            if (cartOpt.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cart not found");
                return ResponseEntity.badRequest().body(error);
            }

            Cart cart = cartOpt.get();
            cart.getCartItems().removeIf(item -> item.getProduct().getId().equals(productId));
            
            Cart savedCart = cartService.saveCart(cart);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Product removed from cart");
            response.put("cart", savedCart);
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to remove from cart: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        try {
            Optional<Cart> cartOpt = cartService.getCartByUserId(userId);
            
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                cart.getCartItems().clear();
                cartService.saveCart(cart);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cart cleared");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to clear cart: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/test/{userId}")
    public ResponseEntity<?> testCart(@PathVariable Long userId) {
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Check if user exists
            Optional<User> userOpt = userService.getUserById(userId);
            response.put("userExists", userOpt.isPresent());
            if (userOpt.isPresent()) {
                response.put("username", userOpt.get().getUsername());
            }
            
            // Check if cart exists
            Optional<Cart> cartOpt = cartService.getCartByUserId(userId);
            response.put("cartExists", cartOpt.isPresent());
            if (cartOpt.isPresent()) {
                Cart cart = cartOpt.get();
                response.put("cartId", cart.getId());
                response.put("cartItemsCount", cart.getCartItems() != null ? cart.getCartItems().size() : 0);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Test failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/debug-add")
    public ResponseEntity<?> debugAddToCart(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== DEBUG ADD TO CART ===");
            System.out.println("Request received: " + request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Debug endpoint working");
            response.put("receivedData", request);
            
            // Check if required fields are present
            if (!request.containsKey("userId")) {
                response.put("error", "Missing userId");
                response.put("success", false);
            }
            if (!request.containsKey("productId")) {
                response.put("error", "Missing productId");
                response.put("success", false);
            }
            if (!request.containsKey("quantity")) {
                response.put("error", "Missing quantity");
                response.put("success", false);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Debug endpoint error: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Debug failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}