package lk.ijse.spring.propos.controller;

import lk.ijse.spring.propos.dto.CustomerDTO;
import lk.ijse.spring.propos.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping("/save")
    public ResponseEntity<String> saveCustomer(
            @RequestPart("customer") CustomerDTO customerDTO,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            String result = customerService.saveCustomer(customerDTO, image);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving customer: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        try {
            List<CustomerDTO> customers = customerService.getAllCustomers();
            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        try {
            CustomerDTO customer = customerService.getCustomerById(id);
            return ResponseEntity.ok(customer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateCustomer(
            @PathVariable Long id,
            @RequestPart("customer") CustomerDTO customerDTO,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        try {
            String result = customerService.updateCustomer(id, customerDTO, image);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating customer: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(@PathVariable Long id) {
        try {
            String result = customerService.deleteCustomer(id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting customer: " + e.getMessage());
        }
    }
}
