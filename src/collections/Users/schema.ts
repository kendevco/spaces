{
  fields: [
    // ... other fields
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: false,
    }
  ],
  hooks: {
    afterLogin: [syncProfile], // Make sure this is properly configured
  }
}
