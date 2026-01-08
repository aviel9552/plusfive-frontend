// Email service for sending welcome emails and login credentials
// This is a mock service - in production, you would integrate with a real email service

export const emailService = {
  // Send welcome email with login credentials
  async sendWelcomeEmail(userData) {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would call your backend API here
      // Example: return await fetch('/api/send-welcome-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData)
      // });
      
      console.log('Welcome email sent to:', userData.email);
      console.log('Email content:', {
        to: userData.email,
        subject: 'Welcome to PlusFive - Your Login Credentials',
        body: `
          Dear ${userData.firstName} ${userData.lastName},
          
          Welcome to PlusFive! Your account has been successfully created.
          
          Here are your login credentials:
          Email: ${userData.email}
          Password: ${userData.password}
          
          Business Details:
          Business Name: ${userData.businessName}
          Business Type: ${userData.businessType}
          
          Please keep these credentials safe. You can change your password after logging in.
          
          Best regards,
          The PlusFive Team
        `
      });
      
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, message: 'Failed to send welcome email' };
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, message: 'Failed to send password reset email' };
    }
  },

  // Send account verification email
  async sendVerificationEmail(email, verificationToken) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  }
};

export default emailService; 