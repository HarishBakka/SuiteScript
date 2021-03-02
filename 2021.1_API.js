CurrentRecord.getSubrecord(options);
//to get a subrecord that does not exist, a new subrecord is created and returned, With this change in behavior, it is no
//longer possible to use this method to check whether a record has an existing subrecord. 
//Use the
CurrentRecord.hasSubrecord(options); //method to determine if the field contains a subrecord.
