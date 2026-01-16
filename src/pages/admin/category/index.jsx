import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ListCategory from '../../../components/admin/category/ListCategory';
import { fetchCategories } from '../../../redux/actions/categoryActions';

function CategoryManagement() {
  const dispatch = useDispatch();
  const categoryState = useSelector((state) => state.category);
  const categories = categoryState?.categories || [];
  const loading = categoryState?.loading || false;
  const error = categoryState?.error || null;
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    
    hasFetchedRef.current = true;
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      <ListCategory 
        categories={categories} 
        loading={loading} 
        error={error}
      />
    </div>
  );
}

export default CategoryManagement;
