import React, { memo, useState } from "react";
import { Text, View } from "react-native";

export const colleges = [
  { label: "University of Central Florida", value: "UCF" },
  { label: "Texas A&M University", value: "TAMU" },
  { label: "Ohio State University", value: "OSU" },
  { label: "Florida International University", value: "FIU" },
  { label: "University of Texas at Austin", value: "UT Austin" },
  { label: "University of Florida", value: "UF" },
  { label: "Arizona State University", value: "ASU" },
  { label: "California State University, Fullerton", value: "CSUF" },
  { label: "University of Illinois at Urbana-Champaign", value: "UIUC" },
  { label: "Pennsylvania State University", value: "Penn State" },
  { label: "Michigan State University", value: "MSU" },
  { label: "California State University, Northridge", value: "CSUN" },
  { label: "University of California, Los Angeles", value: "UCLA" },
  { label: "University of Minnesota, Twin Cities", value: "UMN" },
  { label: "Indiana University Bloomington", value: "IU" },
  { label: "University of Alabama", value: "UA" },
  { label: "University of South Florida", value: "USF" },
  { label: "California State University, Long Beach", value: "CSULB" },
  { label: "Purdue University", value: "PU" },
  { label: "University of Georgia", value: "UGA" },
  { label: "Rutgers University", value: "RU" },
  { label: "University of Washington", value: "UW" },
  { label: "University of Maryland", value: "UMD" },
  { label: "New York University", value: "NYU" },
  { label: "University of Michigan", value: "UM" },
  { label: "University of Wisconsin-Madison", value: "UW-Madison" },
  { label: "University of Southern California", value: "USC" },
  { label: "University of North Carolina at Chapel Hill", value: "UNC" },
  { label: "University of Colorado Boulder", value: "CU Boulder" },
  { label: "University of Virginia", value: "UVA" },
  { label: "University of California, Berkeley", value: "UC Berkeley" },
  { label: "University of California, San Diego", value: "UCSD" },
  { label: "University of California, Davis", value: "UC Davis" },
  { label: "University of California, Irvine", value: "UCI" },
  { label: "University of California, Santa Barbara", value: "UCSB" },
  { label: "University of California, Riverside", value: "UCR" },
  { label: "University of California, Santa Cruz", value: "UCSC" },
  { label: "University of Pennsylvania", value: "UPenn" },
  { label: "University of Tennessee, Knoxville", value: "UTK" },
  { label: "University of Kentucky", value: "UK" },
  { label: "University of South Carolina", value: "USC" },
  { label: "University of Missouri", value: "Mizzou" },
  { label: "University of Oklahoma", value: "OU" },
  { label: "University of Nebraska–Lincoln", value: "UNL" },
  { label: "University of Iowa", value: "UI" },
  { label: "University of Arkansas", value: "UARK" },
  { label: "University of Oregon", value: "UO" },
  { label: "University of Mississippi", value: "Ole Miss" },
  { label: "Florida State University", value: "FSU" },
];

//export default CollegePicker;
