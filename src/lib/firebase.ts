import { error } from "console";
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyAlqO3M-VHJMvP5uWBxGUzk3GhN-sp1X2c",
  authDomain: "gitbrain-123.firebaseapp.com",
  projectId: "gitbrain-123",
  storageBucket: "gitbrain-123.firebasestorage.app",
  messagingSenderId: "666694524816",
  appId: "1:666694524816:web:d93a1b18242a560a6a9d15",
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);

export async function uploadFile(
  file: File,
  setProgress?: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          if (setProgress) setProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("upload is passed");
              break;

            case "running":
              console.log("upload is running");
              break;
          }
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            resolve(downloadUrl);
          });
        },
      );
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
