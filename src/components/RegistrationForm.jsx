// src/components/RegistrationForm.jsx
// FINAL VERSION WITH FILE UPLOADS

import { useState } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this path is correct

function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    gender: '',
    jobRole: '',
    company: '',
    comments: '',
    terms: false,
    cvFile: null,
    headshotFile: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // CORRECTED: This handleChange now properly handles file inputs
  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] })); // Get the first (and only) file
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
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
    // Add validation for file types or sizes here if desired
    // Example: if (formData.cvFile && formData.cvFile.size > 5 * 1024 * 1024) newErrors.cvFile = 'CV too large (max 5MB)';
    return newErrors;
  };

  // UPDATED: handleSubmit now includes file upload logic
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log('Form is valid, processing uploads and then submitting data...');

      let cvStorageUrl = null;
      let headshotStorageUrl = null;

      // 1. Upload CV if a file is present
      if (formData.cvFile) {
        const cvFilePath = `public/cvs/${Date.now()}-${formData.cvFile.name}`;
        try {
          const { data: cvUploadData, error: cvUploadError } = await supabase
            .storage
            .from('cv-uploads') // Your CV bucket name
            .upload(cvFilePath, formData.cvFile);

          if (cvUploadError) {
            throw cvUploadError; 
          }
          const { data: { publicUrl } } = supabase.storage.from('cv-uploads').getPublicUrl(cvFilePath);
          cvStorageUrl = publicUrl;
          console.log('CV uploaded successfully, URL:', cvStorageUrl);
        } catch (cvError) {
            console.error('CV Upload Error:', cvError);
            alert('CV upload failed. Please try again or check the console.');
            setErrors(prev => ({...prev, cvFile: 'CV upload failed: ' + (cvError.message || 'Unknown error') }));
            return; 
        }
      }

      // 2. Upload Headshot if a file is present
      if (formData.headshotFile) {
        const headshotFilePath = `public/headshots/${Date.now()}-${formData.headshotFile.name}`;
        try {
          const { data: headshotUploadData, error: headshotUploadError } = await supabase
            .storage
            .from('headshot-uploads') // Your headshot bucket name
            .upload(headshotFilePath, formData.headshotFile);

          if (headshotUploadError) {
            throw headshotUploadError;
          }
          const { data: { publicUrl } } = supabase.storage.from('headshot-uploads').getPublicUrl(headshotFilePath);
          headshotStorageUrl = publicUrl;
          console.log('Headshot uploaded successfully, URL:', headshotStorageUrl);
        } catch (headshotError) {
            console.error('Headshot Upload Error:', headshotError);
            alert('Headshot upload failed. Please try again or check the console.');
            setErrors(prev => ({...prev, headshotFile: 'Headshot upload failed: ' + (headshotError.message || 'Unknown error') }));
            return; 
        }
      }

      // 3. Prepare data for the 'registrations' database table
      const dataToSubmitToTable = {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        jobRole: formData.jobRole,
        company: formData.company,
        comments: formData.comments,
        terms: formData.terms,
        cv_url: cvStorageUrl,         
        headshot_url: headshotStorageUrl, 
      };

      // 4. Send data to your 'registrations' table API
      try {
        const response = await fetch('https://qefbglcobobxiqzhtsxd.supabase.co/rest/v1/registrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Your Supabase anon key - ensure this is correct
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmJnbGNvYm9ieGlxemh0c3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgzNTksImV4cCI6MjA2MzgxNDM1OX0.GJygwb8W9Tfk0hyK2Gw3h-OZ7Zkzc5BCeZqo7uwnUe4',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZmJnbGNvYm9ieGlxemh0c3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgzNTksImV4cCI6MjA2MzgxNDM1OX0.GJygwb8W9Tfk0hyK2Gw3h-OZ7Zkzc5BCeZqo7uwnUe4',
          },
          body: JSON.stringify(dataToSubmitToTable), 
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API Error submitting form data: ${JSON.stringify(errorData)}`);
        }
        
        console.log('Form data submitted successfully to database!');
        setIsSubmitted(true); 

      } catch (tableError) {
        console.error('Database submission failed:::::::::::::', tableError); // User's original log
        alert('Form data submission failed. Please check the console for details.');
      }
    } else {
      console.log('Form is invalid. Errors were set by validate function.');
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
        <option value="Leonardo" />
        <option value="VTC" />
        <option value="Hensel Phelps" />
          <option value="American Airlines" />
          <option value="Delta Air Lines" />
          <option value="United Airlines" />
          <option value="Southwest Airlines" />
          <option value="DFW International Airport" />
        </datalist>
      </div>

      {/* --- CV Upload --- */}
      <div className="form-group">
        <label htmlFor="cvFile">Upload CV (PDF only):</label>
        <input 
          type="file" 
          id="cvFile" 
          name="cvFile"
          accept=".pdf"
          onChange={handleChange} 
        />
        {errors.cvFile && <div className="error-message">{errors.cvFile}</div>}
      </div>

      {/* --- Headshot Upload --- */}
      <div className="form-group">
        <label htmlFor="headshotFile">Upload Headshot (Image):</label>
        <input 
          type="file" 
          id="headshotFile" 
          name="headshotFile"
          accept="image/*"
          onChange={handleChange} 
        />
        {errors.headshotFile && <div className="error-message">{errors.headshotFile}</div>}
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