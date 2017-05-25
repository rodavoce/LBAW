<?php
function to_pg_array($set) {
    settype($set, 'array'); // can be called with a scalar or array
    $result = array();
    foreach ($set as $t) {
        if (is_array($t)) {
            $result[] = to_pg_array($t);
        } else {
            $t = str_replace('"', '\\"', $t); // escape double quote
            if (! is_numeric($t)) // quote only non-numeric values
                $t = '"' . $t . '"';
            $result[] = $t;
        }
    }
    return '{' . implode(",", $result) . '}'; // format
}

function getNames($name) {
    $parts = array();

    $parts = explode(" ", $name);
    $lastname = array_pop($parts);
    $firstname = $parts[0];

    return array('first_name' => $firstname, 'last_name' => $lastname);
}
?>
