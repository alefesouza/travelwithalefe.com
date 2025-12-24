import getCookie from './get-cookies';

const useEditMode = async ({ edit_mode: editMode }) => {
  const editModeCookie = await getCookie('edit_mode');
  const autoOpenEdit = await getCookie('auto_open_edit');
  const forceEditTextMode = await getCookie('force_edit_text_mode');

  return {
    editMode:
      editModeCookie ||
      editMode === 'true' ||
      process.env.USER === 'alefesouza',
    forceEditTextMode: forceEditTextMode === 'true',
    autoOpenEdit: autoOpenEdit === 'true',
  };
};

export default useEditMode;
