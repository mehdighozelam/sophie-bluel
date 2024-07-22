// Fonction pour récupérer les travaux de l'API et les afficher
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    if (response.ok) {
      const works = await response.json();
      displayWorks(works); // Appel de la fonction pour afficher les travaux
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
}

// Fonction pour afficher les travaux dans la galerie
function displayWorks(works) {
  const gallery = document.querySelector("div.gallery");
  gallery.innerHTML = "";
  works.forEach((work) => {
    const myFigure = document.createElement("figure");
    myFigure.setAttribute(
      "class",
      `work-item category-id-0 category-id-${work.categoryId}`
    );
    myFigure.setAttribute("id", `work-item-${work.id}`);

    const myImg = document.createElement("img");
    myImg.setAttribute("src", work.imageUrl);
    myImg.setAttribute("alt", work.title);
    myFigure.appendChild(myImg);

    const myFigCaption = document.createElement("figcaption");
    myFigCaption.textContent = work.title;
    myFigure.appendChild(myFigCaption);

    gallery.appendChild(myFigure);
  });
}

// Fonction pour récupérer les catégories de l'API et les afficher
async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (response.ok) {
      const categories = await response.json();
      categories.unshift({ id: 0, name: "Tous" }); // Ajouter une catégorie "Tous" en premier
      displayCategories(categories); // Appel de la fonction pour afficher les catégories
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
  }
}

// Fonction pour afficher les catégories sous forme de boutons
function displayCategories(categories) {
  const filtersContainer = document.querySelector("div.filters");
  filtersContainer.innerHTML = "";
  categories.forEach((category) => {
    const myButton = document.createElement("button");
    myButton.classList.add("work-filter", "filters-design");
    if (category.id === 0)
      myButton.classList.add("filter-active", "filter-all");
    myButton.setAttribute("data-filter", category.id);
    myButton.textContent = category.name;
    filtersContainer.appendChild(myButton);

    // Ajouter un écouteur d'événement pour filtrer les travaux lors du clic
    myButton.addEventListener("click", function (event) {
      event.preventDefault();
      filterWorks(category.id);
    });
  });
}

// Fonction pour filtrer les travaux selon la catégorie sélectionnée
function filterWorks(categoryId) {
  document.querySelectorAll(".work-filter").forEach((workFilter) => {
    workFilter.classList.remove("filter-active");
  });
  document
    .querySelector(`button[data-filter='${categoryId}']`)
    .classList.add("filter-active");

  document.querySelectorAll(".work-item").forEach((workItem) => {
    workItem.style.display = "none";
  });
  document
    .querySelectorAll(`.work-item.category-id-${categoryId}`)
    .forEach((workItem) => {
      workItem.style.display = "block";
    });
}

// Gestion de la partie modale
document.addEventListener("DOMContentLoaded", function () {
  // Vérification du token et de l'userId pour le mode admin
  if (
    localStorage.getItem("token") != null &&
    localStorage.getItem("userId") != null
  ) {
    document.querySelector("body").classList.add("connected");
    document.getElementById("top-bar").style.display = "flex";
    document.getElementById("all-filters").style.display = "none";
    document.getElementById("space-only-admin").style.paddingBottom = "100px";
    document.getElementById(
      "space-introduction-in-mode-admin"
    ).style.marginTop = "-50px";
  }

  // Gestion de la déconnexion
  document
    .getElementById("nav-logout")
    .addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      document.querySelector("body").classList.remove("connected");
      document.getElementById("top-bar").style.display = "none";
      document.getElementById("all-filters").style.display = "flex";
      document.getElementById("space-only-admin").style.paddingBottom = "0";
    });

  // Ouverture de la modale pour la mise à jour des travaux
  document
    .getElementById("update-works")
    .addEventListener("click", function (event) {
      event.preventDefault();
      fetch("http://localhost:5678/api/works")
        .then(function (response) {
          if (response.ok) {
            return response.json();
          }
        })
        .then(function (data) {
          let works = data;
          document.querySelector("#modal-works .modal-content").innerHTML = "";
          works.forEach((work) => {
            let myFigure = document.createElement("figure");
            myFigure.setAttribute(
              "class",
              `work-item category-id-0 category-id-${work.categoryId}`
            );
            myFigure.setAttribute("id", `work-item-popup-${work.id}`);
            let myImg = document.createElement("img");
            myImg.setAttribute("src", work.imageUrl);
            myImg.setAttribute("alt", work.title);
            myFigure.appendChild(myImg);
            let myFigCaption = document.createElement("figcaption");
            myFigCaption.textContent = "éditer";
            myFigure.appendChild(myFigCaption);
            let crossDragDrop = document.createElement("i");
            crossDragDrop.classList.add(
              "fa-solid",
              "fa-arrows-up-down-left-right",
              "cross"
            );
            myFigure.appendChild(crossDragDrop);
            let trashIcon = document.createElement("i");
            trashIcon.classList.add("fa-solid", "fa-trash-can", "trash");
            myFigure.appendChild(trashIcon);

            // Gestion de la suppression des travaux
            trashIcon.addEventListener("click", function (event) {
              event.preventDefault();
              if (confirm("Voulez-vous supprimer cet élément ?")) {
                fetch(`http://localhost:5678/api/works/${work.id}`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                  },
                })
                  .then(function (response) {
                    switch (response.status) {
                      case 500:
                      case 503:
                        alert("Comportement inattendu!");
                        break;
                      case 401:
                        alert("Suppression impossible!");
                        break;
                      case 200:
                      case 204:
                        console.log("Projet supprimé.");
                        document
                          .getElementById(`work-item-${work.id}`)
                          .remove();
                        document
                          .getElementById(`work-item-popup-${work.id}`)
                          .remove();
                        break;
                      default:
                        alert("Erreur inconnue!");
                        break;
                    }
                  })
                  .catch(function (err) {
                    console.log(err);
                  });
              }
            });

            document.querySelector("div.modal-content").appendChild(myFigure);
          });
          document.getElementById("modal").style.display = "flex";
          document.getElementById("modal-works").style.display = "block";
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  // Gestion des clics pour fermer la modale
  document.querySelectorAll("#modal-works").forEach((modalWorks) => {
    modalWorks.addEventListener("click", function (event) {
      event.stopPropagation();
    });
    document.querySelectorAll("#modal-edit").forEach((modalEdit) => {
      modalEdit.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      document
        .getElementById("modal")
        .addEventListener("click", function (event) {
          event.preventDefault();
          let modal = document.getElementById("modal");
          modal.style.display = "none";
          let modalWorks = document.getElementById("modal-works");
          modalWorks.style.display = "none";
          let modalEdit = document.getElementById("modal-edit");
          modalEdit.style.display = "none";
          if (document.getElementById("form-image-preview") != null) {
            document.getElementById("form-image-preview").remove();
          }
          document.getElementById("modal-edit-work-form").reset();
          document.getElementById("photo-add-icon").style.display = "block";
          document.getElementById("new-image").style.display = "block";
          document.getElementById("photo-size").style.display = "block";
          document.getElementById("modal-edit-new-photo").style.padding =
            "30px 0 19px 0";
          document.getElementById("submit-new-work").style.backgroundColor =
            "#A7A7A7";
        });
    });
  });

  // Fermeture de la première fenêtre de la modale
  document
    .getElementById("button-to-close-first-window")
    .addEventListener("click", function (event) {
      event.preventDefault();
      let modal = document.getElementById("modal");
      modal.style.display = "none";
      let modalWorks = document.getElementById("modal-works");
      modalWorks.style.display = "none";
    });

  // Fermeture de la deuxième fenêtre de la modale
  document
    .getElementById("button-to-close-second-window")
    .addEventListener("click", function (event) {
      event.preventDefault();
      let modal = document.getElementById("modal");
      modal.style.display = "none";
      let modalEdit = document.getElementById("modal-edit");
      modalEdit.style.display = "none";
      if (document.getElementById("form-image-preview") != null) {
        document.getElementById("form-image-preview").remove();
      }
      document.getElementById("modal-edit-work-form").reset();
      document.getElementById("photo-add-icon").style.display = "block";
      document.getElementById("new-image").style.display = "block";
      document.getElementById("photo-size").style.display = "block";
      document.getElementById("modal-edit-new-photo").style.padding =
        "30px 0 19px 0";
      document.getElementById("submit-new-work").style.backgroundColor =
        "#A7A7A7";
    });

  // Ouverture de la deuxième fenêtre de la modale pour ajouter une photo
  document
    .getElementById("modal-edit-add")
    .addEventListener("click", function (event) {
      event.preventDefault();
      let modalWorks = document.getElementById("modal-works");
      modalWorks.style.display = "none";
      let modalEdit = document.getElementById("modal-edit");
      modalEdit.style.display = "block";
    });

  // Retour à la première fenêtre de la modale
  document
    .getElementById("arrow-return")
    .addEventListener("click", function (event) {
      event.preventDefault();
      let modalWorks = document.getElementById("modal-works");
      modalWorks.style.display = "block";
      let modalEdit = document.getElementById("modal-edit");
      modalEdit.style.display = "none";
      if (document.getElementById("form-image-preview") != null) {
        document.getElementById("form-image-preview").remove();
      }
      document.getElementById("modal-edit-work-form").reset();
      document.getElementById("photo-add-icon").style.display = "block";
      document.getElementById("new-image").style.display = "block";
      document.getElementById("photo-size").style.display = "block";
      document.getElementById("modal-edit-new-photo").style.padding =
        "30px 0 19px 0";
      document.getElementById("submit-new-work").style.backgroundColor =
        "#A7A7A7";
    });

  // Récupération des catégories pour le formulaire de la modale
  fetch("http://localhost:5678/api/categories")
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
    })
    .then(function (data) {
      let categories = data;
      categories.forEach((category) => {
        let myOption = document.createElement("option");
        myOption.setAttribute("value", category.id);
        myOption.textContent = category.name;
        document.querySelector("select.choice-category").appendChild(myOption);
      });
    })
    .catch(function (err) {
      console.log(err);
    });

  // Soumission du formulaire pour ajouter un nouveau travail
  document
    .getElementById("modal-edit-work-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      let formData = new FormData();
      formData.append("title", document.getElementById("form-title").value);
      formData.append(
        "category",
        document.getElementById("form-category").value
      );
      formData.append("image", document.getElementById("form-image").files[0]);
      fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: formData,
      })
        .then(function (response) {
          switch (response.status) {
            case 500:
            case 503:
              alert("Erreur inattendue!");
              break;
            case 400:
            case 404:
              alert("Impossible d'ajouter le nouveau projet!");
              break;
            case 200:
            case 201:
              console.log("Projet ajouté avec succès!");
              return response.json();
            default:
              alert("Erreur inconnue!");
              break;
          }
        })
        .then(function (json) {
          if (json) {
            let myFigure = document.createElement("figure");
            myFigure.setAttribute(
              "class",
              `work-item category-id-0 category-id-${json.categoryId}`
            );
            myFigure.setAttribute("id", `work-item-${json.id}`);
            let myImg = document.createElement("img");
            myImg.setAttribute("src", json.imageUrl);
            myImg.setAttribute("alt", json.title);
            myFigure.appendChild(myImg);
            let myFigCaption = document.createElement("figcaption");
            myFigCaption.textContent = json.title;
            myFigure.appendChild(myFigCaption);
            document.querySelector("div.gallery").appendChild(myFigure);
            let modal = document.getElementById("modal");
            modal.style.display = "none";
            let modalEdit = document.getElementById("modal-edit");
            modalEdit.style.display = "none";
            if (document.getElementById("form-image-preview") != null) {
              document.getElementById("form-image-preview").remove();
            }
            document.getElementById("modal-edit-work-form").reset();
            document.getElementById("photo-add-icon").style.display = "block";
            document.getElementById("new-image").style.display = "block";
            document.getElementById("photo-size").style.display = "block";
            document.getElementById("modal-edit-new-photo").style.padding =
              "30px 0 19px 0";
            document.getElementById("submit-new-work").style.backgroundColor =
              "#A7A7A7";
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    });

  // Gestion de l'affichage de l'aperçu de l'image
  document.getElementById("form-image").addEventListener("change", () => {
    let fileInput = document.getElementById("form-image");
    const maxFileSize = 4 * 1024 * 1024; // 4 Mo
    if (fileInput.files[0].size > maxFileSize) {
      alert(
        "Le fichier sélectionné est trop volumineux. La taille maximale est de 4 Mo."
      );
      document.getElementById("form-image").value = "";
    } else {
      if (fileInput.files.length > 0) {
        let myPreviewImage = document.createElement("img");
        myPreviewImage.setAttribute("id", "form-image-preview");
        myPreviewImage.src = URL.createObjectURL(fileInput.files[0]);
        document
          .querySelector("#modal-edit-new-photo")
          .appendChild(myPreviewImage);
        myPreviewImage.style.display = "block";
        myPreviewImage.style.height = "169px";
        document.getElementById("photo-add-icon").style.display = "none";
        document.getElementById("new-image").style.display = "none";
        document.getElementById("photo-size").style.display = "none";
        document.getElementById("modal-edit-new-photo").style.padding = "0";
      }
    }
  });

  // Vérification des champs du formulaire
  document
    .getElementById("form-title")
    .addEventListener("input", checkNewProjectFields);
  document
    .getElementById("form-category")
    .addEventListener("input", checkNewProjectFields);
  document
    .getElementById("form-image")
    .addEventListener("input", checkNewProjectFields);

  // Fonction pour vérifier les champs du formulaire
  function checkNewProjectFields() {
    let title = document.getElementById("form-title").value.trim();
    let category = document.getElementById("form-category").value.trim();
    let image = document.getElementById("form-image").files.length > 0;
    let submitWork = document.getElementById("submit-new-work");
    if (title === "" || category === "" || !image) {
      submitWork.style.backgroundColor = "#A7A7A7";
    } else {
      submitWork.style.backgroundColor = "#1D6154";
    }
  }
});

// Initialisation des fonctions pour récupérer et afficher les travaux et catégories
fetchWorks();
fetchCategories();
