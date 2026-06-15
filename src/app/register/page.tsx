'use client';

import React from 'react';
import RegisterForm from '../../../components/RegisterForm';
import Image from 'next/image';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        
        <div className="w-full max-w-[280px] rounded-2xl border border-zinc-100 mb-6 overflow-hidden shadow-xs bg-white">
          <Image
            src="/logo.png"
            alt="SAFE-PASSWORD Logo"
            width={1024}
            height={559}
            className="w-full h-auto block"
            priority
          />
        </div>

        <div className="w-full">
          <RegisterForm />
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;