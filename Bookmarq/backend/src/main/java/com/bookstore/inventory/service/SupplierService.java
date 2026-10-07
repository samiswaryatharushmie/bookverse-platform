package com.bookstore.inventory.service;

import com.bookstore.common.exception.ResourceNotFoundException;
import com.bookstore.inventory.dto.SupplierDto;
import com.bookstore.inventory.dto.SupplierRequest;
import com.bookstore.inventory.entity.Supplier;
import com.bookstore.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public SupplierDto createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier();
        apply(supplier, request);
        return toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDto updateSupplier(UUID id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        apply(supplier, request);
        return toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier not found");
        }
        supplierRepository.deleteById(id);
    }

    private void apply(Supplier supplier, SupplierRequest request) {
        supplier.setName(request.getName());
        supplier.setContactName(request.getContactName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setActive(request.isActive());
    }

    private SupplierDto toDto(Supplier s) {
        SupplierDto dto = new SupplierDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setContactName(s.getContactName());
        dto.setEmail(s.getEmail());
        dto.setPhone(s.getPhone());
        dto.setAddress(s.getAddress());
        dto.setActive(s.isActive());
        return dto;
    }
}
