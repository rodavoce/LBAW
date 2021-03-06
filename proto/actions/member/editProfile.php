<?php
include_once('../../config/init.php');
include_once("../../utils.php");
include_once("../../database/account.php");
include_once("../../database/email.php");

if($_SESSION["s_token"]!==$_POST["s_token"]){
	header('Location: ../../pages/common/error.php');
}

if(isset($_POST['name'])) {
	$id = $_SESSION['id'];
	$name = htmlspecialchars(trim($_POST['name']));
	$location = htmlspecialchars(trim($_POST['location']));
	$newEmails = array_filter(array_map('trim', $_POST['email']));
	$links = array_filter(array_map('trim', $_POST['link']));

	$oldEmails = getUserEmailList($id);
	$toDelete = array();

	foreach ($oldEmails as $email) {
		// if the email already exists, delete from newEmails array
		if(($key = array_search($email['mail'], $newEmails)) !== false) {
	    	unset($newEmails[$key]);
		} else {
			// if the email doesn't exists in the newEmails array, delete it
			array_push($toDelete, $email['id']);
		}
	}

	try {
		updateEmails($id, $toDelete, $newEmails);
		updateProfile($id, $name, to_pg_array($links));
	} catch (PDOException $e) {
		saveOnLog("editProfile (Info): ", $e->getMessage());
	}
} else if (sizeof($_POST["git_username"]) > 0) {
	$currentImage=getUserImage($_SESSION["id"]);
	unlink($currentImage);
	setUserImage($_POST["github-image-url"],$_SESSION["id"]);
} else if ($_FILES["upload-image"]["error"] == 0) {
	print_r($_FILES);
	$destination_directory = "../../resources/images/users/";
	$temporary = explode(".", $_FILES["upload-image"]["name"]);
	$file_extension = end($temporary);

	$sourcePath = $_FILES["upload-image"]["tmp_name"];
	$targetPath = $destination_directory . $_SESSION["username"] . "." . $file_extension;

	$currentImage=getUserImage($_SESSION["id"]);
	unlink($currentImage);
	move_uploaded_file($sourcePath, $targetPath);
	setUserImage($targetPath,$_SESSION["id"]);
}

header("Location: ../../pages/member/profile.php?id=" . $_SESSION["id"]);

?>
