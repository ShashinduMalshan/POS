package lk.ijse.spring.propos.dto;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CustomerDTO {
    private String name;
    private String email;
    private String phone;
    private String imagePath;
}
