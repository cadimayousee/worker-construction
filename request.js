
const baseurl = `https://iw77uki0.directus.app`;
import axios from "axios";

// Private helper function
function handleResponse(xhr, resolve, reject) {
  xhr.addEventListener("load", () => {
    if (xhr.response) {
      let statusCode = xhr.status;

      let response;
      try {
        response = JSON.parse(xhr.response);
      } catch (err) {
        reject({ code: statusCode });
      }

      if (
        statusCode === 200 ||
        statusCode === 201 ||
        statusCode === 202 ||
        statusCode === 204
      ) {
        resolve(response);
      } else {
        reject(response);
      }
    } else {
      resolve();
    }
  });
}

function get(url, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    handleResponse(xhr, resolve, reject);

    xhr.open("GET", baseurl + url);
    if (options && options.headers) {
      for (const header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }
    xhr.send();
  });
}

function post(url, options, header = {}) {
  return axios.post(baseurl + url, options, header).then((res) => {
    // console.log(res);
    return res;
  });
  // .catch((e) => console.log(e));
}
function patch(url, options, header = {}) {
  return axios.patch(baseurl + url, options, header).then((res) => {
    console.log(res);
    return res;
  });
}
function postFile(url, file, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    handleResponse(xhr, resolve, reject);

    xhr.open("POST", baseurl + url, true);
    if (options && options.headers) {
      for (const header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }
    xhr.send(file);
  });
}

function del(url, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    handleResponse(xhr, resolve, reject);

    xhr.open("DELETE", baseurl + url, true);
    if (options && options.headers) {
      for (const header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }
    xhr.send(JSON.stringify(options.body));
  });
}

function noApiPost(url, options) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    handleResponse(xhr, resolve, reject);

    xhr.open("POST", url, true);
    if (options && options.headers) {
      for (const header in options.headers) {
        xhr.setRequestHeader(header, options.headers[header]);
      }
    }
    if (options && options.body) {
      xhr.send(options.body);
      console.log(JSON.stringify(options.body));
    } else {
      xhr.send();
    }
  });
}

export default {
  get,
  post,
  postFile,
  patch,
  del,
  noApiPost,
};