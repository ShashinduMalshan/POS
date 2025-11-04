package lk.ijse.spring.propos.service;

import lk.ijse.spring.propos.dto.CustomerDTO;
import lk.ijse.spring.propos.entity.Customer;
import lk.ijse.spring.propos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    public String saveCustomer(CustomerDTO customerDTO, MultipartFile image) throws IOException {
        String imagePath = null;

        if (image != null && !image.isEmpty()) {
            // Save image in uploads folder
            String uploadDir = "uploads/customers/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            Path path = Paths.get(uploadDir + image.getOriginalFilename());
            Files.write(path, image.getBytes());

            imagePath = path.toString();
        }

        Customer customer = Customer.builder()
                .name(customerDTO.getName())
                .email(customerDTO.getEmail())
                .phone(customerDTO.getPhone())
                .build();

        customerRepository.save(customer);
        return "Customer saved successfully!";
    }


    public List<CustomerDTO> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    private CustomerDTO convertToDTO(Customer customer) {
        return new CustomerDTO(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone()
        );
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return convertToDTO(customer);
    }

    public String updateCustomer(Long id, CustomerDTO customerDTO, MultipartFile image) throws IOException {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

//        String imagePath = existingCustomer.getImagePath();
//
//        // If new image is provided, save it and delete old one
//        if (image != null && !image.isEmpty()) {
//            // Delete old image if exists
//            if (imagePath != null) {
//                try {
//                    Files.deleteIfExists(Paths.get(imagePath));
//                } catch (IOException e) {
//                    System.out.println("Could not delete old image: " + e.getMessage());
//                }
//            }
//
//            // Save new image
//            String uploadDir = "uploads/customers/";
//            File dir = new File(uploadDir);
//            if (!dir.exists()) dir.mkdirs();
//
//            Path path = Paths.get(uploadDir + image.getOriginalFilename());
//            Files.write(path, image.getBytes());
//            imagePath = path.toString();
//        }

        // Update customer fields
        existingCustomer.setName(customerDTO.getName());
        existingCustomer.setEmail(customerDTO.getEmail());
        existingCustomer.setPhone(customerDTO.getPhone());
//        existingCustomer.setImagePath(imagePath);

        customerRepository.save(existingCustomer);
        return "Customer updated successfully!";
    }

    public String deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        // Delete associated image if exists
//        if (customer.getImagePath() != null) {
//            try {
//                Files.deleteIfExists(Paths.get(customer.getImagePath()));
//            } catch (IOException e) {
//                System.out.println("Could not delete customer image: " + e.getMessage());
//            }
//        }

        customerRepository.deleteById(id);
        return "Customer deleted successfully!";
    }
}