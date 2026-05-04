package com.vizor.backend.repository;

import com.vizor.backend.entity.Roundtable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundtableRepository extends JpaRepository<Roundtable, Long> {
}
