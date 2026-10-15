import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LivePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/schedule', { replace: true });
  }, [navigate]);

  return null;
};
