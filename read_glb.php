<?php
$file = 'ACLC2.glb';
$data = file_get_contents($file);
preg_match_all('/"name"\s*:\s*"([^"]+)"/', $data, $matches);
$names = array_unique($matches[1]);
foreach ($names as $name) echo $name . "\n";
?>