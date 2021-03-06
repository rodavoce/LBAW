<?php
if (!isset($_GET["id"]) || !preg_match('/^\d+$/', $_GET["id"])) {
    header("Location: ../common/error.php");
}

include_once('../../config/init.php');
include_once("../../database/account.php");
include_once("../../database/email.php");
include_once("../../database/topics.php");
include_once("../../utils.php");

$userid = htmlspecialchars(trim($_GET["id"]));

try {
    $user = getAccountByUserId($userid);
} catch(PDOException $e) {
    saveOnLog("profile.php:", $e);
    header("Location: ../common/error.php?msg=" . $e->getMessage());
}


if (!isset($user)) {
    header("Location: ../common/error.php?msg=" . "Utilizador não existe");
}

include_once("../common/header.php");


try {
    $emails = getUserEmailList($userid);
    $links = json_decode(getUserLinks($userid)[0]['links']);
    $topics = getTopicsByUser($userid);

    $topicsTimeline = timelineGetTopics($userid);
    $answers = timelineGetAnswers($userid);
    $comments = timelineGetComments($userid);
    $commentsAnswers = timelineGetCommentsAnswers($userid);
    $timeline = array_merge($topicsTimeline, $answers, $comments, $commentsAnswers);
    usort($timeline, "sortTimeline");

    $creationDate = getAccountByUserId($userid)['creationdate'];
} catch(PDOException $e) {
    saveOnLog("profile.php:", $e->getMessage());
}

$smarty->assign('user', $user);
$smarty->assign('emails', $emails);
$smarty->assign('links', $links);
$smarty->assign('topics', $topics);
$smarty->assign('timeline', $timeline);
$smarty->assign('creationDate', $creationDate);
$smarty->display('member/profile.tpl');
?>