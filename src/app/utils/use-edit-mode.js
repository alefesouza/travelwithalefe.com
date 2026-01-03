const useEditMode = async () => {
  return {
    editMode: process.env.EDIT_MODE === 'true',
    forceEditTextMode: process.env.FORCE_EDIT_TEXT_MODE === 'true',
    autoOpenEdit: process.env.AUTO_OPEN_EDIT === 'true',
  };
};

export default useEditMode;
