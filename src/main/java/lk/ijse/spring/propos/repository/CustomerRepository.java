package lk.ijse.spring.propos.repository;

import lk.ijse.spring.propos.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
