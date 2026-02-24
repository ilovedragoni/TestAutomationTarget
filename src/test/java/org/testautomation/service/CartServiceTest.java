package org.testautomation.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.testautomation.converter.ProductConverter;
import org.testautomation.domain.CartItemRequest;
import org.testautomation.domain.CartResponse;
import org.testautomation.domain.CategoryDTO;
import org.testautomation.domain.ProductDTO;
import org.testautomation.entity.Product;
import org.testautomation.entity.UserAccount;
import org.testautomation.entity.UserCartItem;
import org.testautomation.repository.ProductRepository;
import org.testautomation.repository.UserAccountRepository;
import org.testautomation.repository.UserCartItemRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyIterable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private UserCartItemRepository userCartItemRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductConverter productConverter;

    @InjectMocks
    private CartService cartService;

    @Test
    void getCartReturnsMappedItemsForUser() {
        UserAccount user = user(1L, "cart@example.com");
        Product product = product(10L, "Keyboard");
        UserCartItem cartItem = new UserCartItem();
        cartItem.setUser(user);
        cartItem.setProduct(product);
        cartItem.setQuantity(3);

        ProductDTO dto = new ProductDTO(10L, "Keyboard", "desc", new BigDecimal("99.90"), new CategoryDTO(1L, "Cat", "Desc"));

        when(userAccountRepository.findByEmailIgnoreCase("cart@example.com")).thenReturn(Optional.of(user));
        when(userCartItemRepository.findByUserId(1L)).thenReturn(List.of(cartItem));
        when(productConverter.toDto(product)).thenReturn(dto);

        CartResponse response = cartService.getCart("cart@example.com");

        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getQuantity()).isEqualTo(3);
        assertThat(response.getItems().get(0).getProduct().getName()).isEqualTo("Keyboard");
    }

    @Test
    void replaceCartMergesQuantitiesAndPersistsReplacement() {
        UserAccount user = user(2L, "replace@example.com");
        Product product = product(50L, "Mouse");

        CartItemRequest itemA = new CartItemRequest();
        itemA.setProductId(50L);
        itemA.setQuantity(1);
        CartItemRequest itemB = new CartItemRequest();
        itemB.setProductId(50L);
        itemB.setQuantity(2);

        when(userAccountRepository.findByEmailIgnoreCase("replace@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findAllById(anyIterable())).thenReturn(List.of(product));
        when(userCartItemRepository.findByUserId(2L)).thenReturn(List.of());

        cartService.replaceCart("replace@example.com", List.of(itemA, itemB));

        verify(userCartItemRepository).deleteByUserId(2L);
        verify(userCartItemRepository).flush();
        ArgumentCaptor<List<UserCartItem>> captor = ArgumentCaptor.forClass(List.class);
        verify(userCartItemRepository).saveAllAndFlush(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
        assertThat(captor.getValue().get(0).getQuantity()).isEqualTo(3);
    }

    @Test
    void replaceCartThrowsForUnknownProduct() {
        UserAccount user = user(3L, "unknown@example.com");
        CartItemRequest item = new CartItemRequest();
        item.setProductId(999L);
        item.setQuantity(1);

        when(userAccountRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.of(user));
        when(productRepository.findAllById(anyIterable())).thenReturn(List.of());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> cartService.replaceCart("unknown@example.com", List.of(item)));
        assertThat(exception.getMessage()).isEqualTo("Unknown product id: 999");
    }

    @Test
    void replaceCartThrowsForInvalidQuantity() {
        UserAccount user = user(4L, "qty@example.com");
        CartItemRequest item = new CartItemRequest();
        item.setProductId(1L);
        item.setQuantity(0);

        when(userAccountRepository.findByEmailIgnoreCase("qty@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> cartService.replaceCart("qty@example.com", List.of(item)));
        assertThat(exception.getMessage()).isEqualTo("quantity must be at least 1");
    }

    @Test
    void clearCartDeletesByUserId() {
        UserAccount user = user(5L, "clear@example.com");
        when(userAccountRepository.findByEmailIgnoreCase("clear@example.com")).thenReturn(Optional.of(user));

        cartService.clearCart("clear@example.com");

        verify(userCartItemRepository).deleteByUserId(5L);
    }

    private UserAccount user(Long id, String email) {
        UserAccount user = new UserAccount();
        user.setId(id);
        user.setEmail(email);
        user.setDisplayName("User");
        user.setPasswordHash("hash");
        user.setEnabled(true);
        return user;
    }

    private Product product(Long id, String name) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setPrice(new BigDecimal("10.00"));
        return product;
    }
}
