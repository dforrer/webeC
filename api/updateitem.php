<?php

/**
 * Copyright Daniel Forrer 2014
 */

/**

Update item:
-------------
POST
/updateitem.php

BODY
{
	"username":"Daniel",
	"token":"53a03780311a5",
	"item_id":5,
	"title":"Mein neues Item",
	"prio":3,
	"tags":"Einkaufen Geschenke Weihnachten",
	"description":"Beschreibung",
	"creation_date":"2000-01-01 00:00:00",
	"is_read":1
}

RESPONSE
{
	"item_id":2
}

*/

// Connect to mysql-database
//---------------------------
$con = mysqli_connect('localhost', 'root', 'y9asCPTE', 'item_manager');
if (!$con)
{
	die('Could not connect: ' . mysqli_error($con));
}

// Get POST-Data from request
//----------------------------
$str_json = file_get_contents('php://input');

// Parse JSON-Data
//-----------------
$json_parsed = json_decode($str_json);

$username 		= $json_parsed->{'username'};
$token 			= $json_parsed->{'token'};
$item_id 		= $json_parsed->{'item_id'};
$title			= $json_parsed->{'title'};
$prio 			= $json_parsed->{'prio'};
$tags	 		= $json_parsed->{'tags'};
$description 	= $json_parsed->{'description'};
$creation_date 	= $json_parsed->{'creation_date'};
$is_read 		= $json_parsed->{'is_read'};

if ($json_parsed == null
	|| $username == null
	|| $token == null
	|| $prio == null
	|| $creation_date == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Execute MySQL-Query
//---------------------
$sql = "SELECT * FROM users WHERE username = '" . $username . "'";

$result = mysqli_query($con, $sql);
if ($result == null)
{
	header('HTTP/1.0 401 Unauthorized');
	exit;
}

// Fetch first row in result set
//-------------------------------
$row = mysqli_fetch_array($result);
if ($row == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Verify user
//-------------
if ($row['token'] != $token)
{
	header('HTTP/1.0 401 Unauthorized');
	exit;
}

$user_id = $row['user_id'];

// Free result set
//-----------------
mysqli_free_result($result);

// Insert item into table
//------------------------
$query = "UPDATE items SET
title = '" . $title . "',
description = '" . $description . "',
prio = '" . $prio . "',
creation_date = '" . $creation_date . "',
is_read = '" . $is_read . "'
WHERE item_id = '" . $item_id . "'
AND user_id = '" . $user_id . "'";

$result = mysqli_query($con, $query);
if ($result == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Echo item_id as JSON
//----------------------
echo "{\"item_id\":";
echo $item_id;
echo "}";

// Free result set
//-----------------
mysqli_free_result($result);

// Remove all references in the items_tags
//-----------------------------------------
$query = "DELETE FROM items_tags
WHERE item_id = '" . $item_id . "'";

$result = mysqli_query($con, $query);
if ($result == null)
{
	header('HTTP/1.0 400 Bad Request');
	exit;
}

// Free result set
//-----------------
mysqli_free_result($result);


// Add tags to TABLES: tags & items_tags
//---------------------------------------
$tagsArray = explode(" ", $tags);
foreach ($tagsArray as $tag)
{
	//echo "Value: $tag<br />\n";

	if ($tag == "")
	{
		continue;
	}

	$tag_id = null;

	// Insert tag
	//------------
	$query = "INSERT INTO tags (name)
	VALUES ('". $tag ."')";

	$result = mysqli_query($con, $query);
	if ($result == null)
	{
		// tag already exists
		//--------------------
		$sql = "SELECT tag_id FROM tags WHERE name = '" . $tag . "'";

		$result = mysqli_query($con, $sql);
		if ($result == null)
		{
			header('HTTP/1.0 400 Bad Request');
			exit;
		}
		$row = mysqli_fetch_array($result);
		$tag_id = $row[0];
	}
	else
	{
		$tag_id = mysqli_insert_id($con);
	}


	// Free result set
	//-----------------
	mysqli_free_result($result);


	// Insert M-N relationship
	//-------------------------
	$query = "INSERT INTO items_tags (item_id, tag_id)
	VALUES ('". $item_id ."','". $tag_id ."')";

	$result = mysqli_query($con, $query);
	if ($result == null)
	{
		// something went wrong
	}

	// Free result set
	//-----------------
	mysqli_free_result($result);

}

mysqli_close($con);


exit;

