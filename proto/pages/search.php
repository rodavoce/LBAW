<?php
if (!isset($_GET["search"])) {
    header("Location: ../pages/error.php");
}
if ($_GET["search"] == null) {
	header("Location: ../pages/home.php");
}

include_once("../config/init.php");
include_once("../pages/header.php");
include_once("../database/topics.php");
include_once("../database/account.php");
include_once("../database/tags.php");

     global $smarty;
     $textSearch=htmlspecialchars(trim($_GET["search"]));

     $result = getTopicWithTitle($textSearch);


      foreach($result as &$topic) {


        $features = getFeaturedTagsTopic($topic["id"]);
        $fTags = array();

        foreach($features as $feature) {
        $tag = getTagById($feature["tagid"]);
        array_push($fTags, $tag);
        }

        $topic["tags"] = $fTags;
        $topic["author"] = getAccountByUserId($topic["userid"])[0]["name"] ;
      }



     $result2 = getTopicWithContent($textSearch);

      foreach($result2 as &$topic) {


        $features = getFeaturedTagsTopic($topic["id"]);
        $fTags = array();

        foreach($features as $feature) {
        $tag = getTagById($feature["tagid"]);
        array_push($fTags, $tag);
        }

        $topic["tags"] = $fTags;
        $topic["author"] = getAccountByUserId($topic["userid"])[0]["name"] ;
      }

     $tag = getTagByName($textSearch);

     $result3 = getTopicWithTag($tag[0]["id"]);



      foreach($result3 as &$topic) {


        $features = getFeaturedTagsTopic($topic["id"]);
        $fTags = array();

        foreach($features as $feature) {
        $tag = getTagById($feature["tagid"]);
        array_push($fTags, $tag);
        }

        $topic["tags"] = $fTags;
        $topic["author"] = getAccountByUserId($topic["userid"])[0]["name"] ;
      }
      
      
      $result4  = getUsersBySearchInput($textSearch);
      
	  echo var_dump($result4);

   $smarty->assign('result',$result);
   $smarty->assign('result2',$result2);
   $smarty->assign('result3',$result3);
   $smarty->assign('users',$result4);
   $smarty->display('search.tpl');
?>
