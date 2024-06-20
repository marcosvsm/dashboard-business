import Swal from "sweetalert2";

const actions = {
  showNotification({ commit, dispatch }, { message, type }) {
    let icon = null;
    switch (type) {
      case 'success':
        icon = 'success';
        break;
      case 'warning':
        icon = 'warning';
        break;
      case 'error':
        icon = 'error';
        break;
      default:
        icon = 'info';
    }

    Swal.fire({
      title: message,
      icon: icon,
      position: 'center',
      showConfirmButton: false,
      timer: 1000
    });
  }
};

export default {
  namespaced: true,
  state: {},
  getters: {},
  actions,
  mutations: {}
};
