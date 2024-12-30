import getCookie from './get-cookies';

const useEditMode = ({ edit_mode: editMode }) => {
  const editModeCookie = getCookie('edit_mode');
  const autoOpenEdit = getCookie('auto_open_edit');
  const forceEditTextMode = getCookie('force_edit_text_mode');

  return {
    editMode: editModeCookie || editMode === 'true',
    forceEditTextMode: forceEditTextMode === 'true',
    autoOpenEdit: autoOpenEdit === 'true',
  };
};

export default useEditMode;
