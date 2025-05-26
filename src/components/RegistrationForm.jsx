// FINAL, SYNTAX-CHECKED VERSION

import { useState } from 'react';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', age: '', gender: '',
    jobRole: '', company: '', comments: '', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.age) {
        newErrors.age = 'Age is required.';
    } else if (Number(formData.age) <= 0) {
        newErrors.age = 'Age must be a positive number.';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required.';
    if (!formData.jobRole) newErrors.jobRole = 'Please select a job role.';
    if (!formData.terms) newErrors.terms = 'You must agree to the terms.';
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch('https://qefbglcobobxiqzhtsxd.supabase.co/rest/v1/registrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmJnbGNvYm9ieGlxemh0c3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgzNTksImV4cCI6MjA2MzgxNDM1OX0.GJygwb8W9Tfk0hyK2Gw3h-OZ7Zkzc5BCeZqo7uwnUe4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmJnbGNvYm9ieGlxemh0c3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgzNTksImV4cCI6MjA2MzgxNDM1OX0.GJygwb8W9Tfk0hyK2Gw3h-OZ7Zkzc5BCeZqo7uwnUe4',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(JSON.stringify(errorData));
        }
        
        setIsSubmitted(true);
      } catch (error) {
        console.error('Submission failed:', error);
        alert('Submission failed. Please check the console for details.');
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="success-message">
        <h2>Thank You For Registering, {formData.fullName}!</h2>
        <p>A confirmation has been sent to your email address at {formData.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="fullName">Full Name:</label>
        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
        {errors.fullName && <div className="error-message">{errors.fullName}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="email">Email Address:</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="age">Age:</label>
        <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} />
        {errors.age && <div className="error-message">{errors.age}</div>}
      </div>
      <div className="form-group">
        <fieldset>
          <legend>Gender:</legend>
          <div className="radio-group">
            <input type="radio" id="male" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} />
            <label htmlFor="male">Male</label>
            <input type="radio" id="female" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} />
            <label htmlFor="female">Female</label>
          </div>
        </fieldset>
        {errors.gender && <div className="error-message">{errors.gender}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="jobRole">Job Role:</label>
        <select id="jobRole" name="jobRole" value={formData.jobRole} onChange={handleChange}>
          <option value="">Please select a role</option>
          <option value="engineer">Engineer</option>
          <option value="manager">Manager</option>
          <option value="director">Director</option>
          <option value="student">Student</option>
          <option value="other">Other</option>
        </select>
        {errors.jobRole && <div className="error-message">{errors.jobRole}</div>}
      </div>
      <div className="form-group">
        <label htmlFor="company">Company:</label>
        <input list="companies" id="company" name="company" value={formData.company} onChange={handleChange} />
        <datalist id="companies">
          <option value="American Airlines" />
          <option value="Delta Air Lines" />
          <option value="United Airlines" />
          <option value="Southwest Airlines" />
          <option value="DFW International Airport" />
        </datalist>
      </div>
      <div className="form-group">
        <label htmlFor="comments">Comments or Questions:</label>
        <textarea id="comments" name="comments" rows="4" value={formData.comments} onChange={handleChange}></textarea>
      </div>
      <div className="form-group checkbox-group">
        <input type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange} />
        <label htmlFor="terms">I agree to the <a href="#" target="_blank" rel="noopener noreferrer">Terms and Conditions</a></label>
      </div>
      {errors.terms && <div className="error-message">{errors.terms}</div>}
      <button type="submit">Register</button>
    </form>
  );
}

export default RegistrationForm;