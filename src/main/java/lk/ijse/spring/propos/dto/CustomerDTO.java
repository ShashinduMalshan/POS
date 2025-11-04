package lk.ijse.spring.propos.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CustomerDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String imagePath;

    public CustomerDTO(Long id, String name, String email, String phone) {
    }
}
