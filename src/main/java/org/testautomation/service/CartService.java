package org.testautomation.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.testautomation.converter.ProductConverter;
import org.testautomation.domain.CartItemRequest;
import org.testautomation.domain.CartItemResponse;
import org.testautomation.domain.CartResponse;
import org.testautomation.entity.Product;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserCartItem;
import org.testautomation.repository.ProductRepository;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserCartItemRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    private final UserCartItemRepository userCartItemRepository;
    private final UserAccountRepository userAccountRepository;
    private final ProductRepository productRepository;
    private final ProductConverter productConverter;

    public CartService(
            UserCartItemRepository userCartItemRepository,
            UserAccountRepository userAccountRepository,
            ProductRepository productRepository,
            ProductConverter productConverter
    ) {
        this.userCartItemRepository = userCartItemRepository;
        this.userAccountRepository = userAccountRepository;
        this.productRepository = productRepository;
        this.productConverter = productConverter;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        UserAccount userAccount = getUserByEmail(email);
        List<CartItemResponse> items = userCartItemRepository.findByUserId(userAccount.getId()).stream()
                .map((item) -> new CartItemResponse(productConverter.toDto(item.getProduct()), item.getQuantity()))
                .toList();
        return new CartResponse(items);
    }

    @Transactional
    public CartResponse replaceCart(String email, List<CartItemRequest> payload) {
        UserAccount userAccount = getUserByEmail(email);
        Map<Long, Integer> quantitiesByProductId = normalize(payload);
        Map<Long, Product> products = loadProducts(quantitiesByProductId.keySet());

        userCartItemRepository.deleteByUserId(userAccount.getId());
        userCartItemRepository.flush();

        List<UserCartItem> replacementItems = quantitiesByProductId.entrySet().stream()
                .map((entry) -> {
                    UserCartItem item = new UserCartItem();
                    item.setUser(userAccount);
                    item.setProduct(products.get(entry.getKey()));
                    item.setQuantity(entry.getValue());
                    return item;
                })
                .toList();

        userCartItemRepository.saveAllAndFlush(replacementItems);
        return getCart(email);
    }

    @Transactional
    public void clearCart(String email) {
        UserAccount userAccount = getUserByEmail(email);
        userCartItemRepository.deleteByUserId(userAccount.getId());
    }

    private Map<Long, Integer> normalize(List<CartItemRequest> payload) {
        Map<Long, Integer> quantities = new HashMap<>();
        if (payload == null) {
            return quantities;
        }

        for (CartItemRequest request : payload) {
            if (request.getProductId() == null) {
                throw new IllegalArgumentException("productId is required");
            }
            if (request.getQuantity() < 1) {
                throw new IllegalArgumentException("quantity must be at least 1");
            }
            quantities.merge(request.getProductId(), request.getQuantity(), Integer::sum);
        }

        return quantities;
    }

    private Map<Long, Product> loadProducts(Iterable<Long> ids) {
        Map<Long, Product> products = new HashMap<>();
        for (Product product : productRepository.findAllById(ids)) {
            products.put(product.getId(), product);
        }

        for (Long id : ids) {
            if (!products.containsKey(id)) {
                throw new IllegalArgumentException("Unknown product id: " + id);
            }
        }

        return products;
    }

    private UserAccount getUserByEmail(String email) {
        return userAccountRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
