package com.example.SecondEcomWeNiraj.service;

import com.example.SecondEcomWeNiraj.entity.Cart;
import com.example.SecondEcomWeNiraj.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {
    
    private final CartRepository cartRepository;

    @Autowired
    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }
    
    public Optional<Cart> getCartByUserId(Long userId) {
        return cartRepository.findByUserId(userId);
    }
    
    public Cart saveCart(Cart cart) {
        return cartRepository.save(cart);
    }
    
    public void deleteCart(Long id) {
        cartRepository.deleteById(id);
    }
}