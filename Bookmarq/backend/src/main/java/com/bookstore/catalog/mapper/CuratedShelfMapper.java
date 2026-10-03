package com.bookstore.catalog.mapper;

import com.bookstore.catalog.dto.CuratedShelfDto;
import com.bookstore.catalog.entity.CuratedShelf;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {BookMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CuratedShelfMapper {
    CuratedShelfDto toDto(CuratedShelf entity);
}
