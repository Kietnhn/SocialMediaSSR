$(document).ready(function () {
    $("#list-posts .card-body a").attr("target", "_blank");
});
$(".imagePreviews").each(function () {
    const length = $(this).data("preview-length");
    $(this).addClass(`template-col-${length}`);
});
$("#confirmDelete").click(function () {
    const postId = $(this).data("post-id");
    window.location.href = `/posts/delete/${postId}`;
});

const handleDeletePost = (postId) => {
    console.log(postId);
    $("#confirmDelete").data("post-id", postId);
};

var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});
