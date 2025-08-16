package lk.ijse.spring.propos.service;

import lk.ijse.spring.propos.dto.CustomerDTO;
import lk.ijse.spring.propos.entity.Customer;
import lk.ijse.spring.propos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

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
                .imagePath(imagePath)
                .build();

        customerRepository.save(customer);
        return "Customer saved successfully!";
    }
}