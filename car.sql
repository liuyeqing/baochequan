/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50703
Source Host           : localhost:3306
Source Database       : car

Target Server Type    : MYSQL
Target Server Version : 50703
File Encoding         : 65001

Date: 2019-12-19 14:44:16
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for order_list
-- ----------------------------
DROP TABLE IF EXISTS `order_list`;
CREATE TABLE `order_list` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `head_portrait` varchar(255) DEFAULT NULL,
  `account` varchar(10) DEFAULT NULL,
  `seat` int(11) DEFAULT NULL,
  `use_car_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `start_city` varchar(20) DEFAULT NULL,
  `end_city` varchar(20) DEFAULT NULL,
  `mileage` float DEFAULT NULL,
  `get_order_people` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of order_list
-- ----------------------------
INSERT INTO `order_list` VALUES ('7', null, 'a', '5', '2019-12-16 18:40:58', '杭州市', '北京市', '1134.94', 'b');
INSERT INTO `order_list` VALUES ('8', '', 'a', '5', '2019-12-16 18:46:08', '杭州市滨江区滨江区人民政府', '杭州市西湖区西湖区人民政府', '9628.06', 'b');

-- ----------------------------
-- Table structure for user_list
-- ----------------------------
DROP TABLE IF EXISTS `user_list`;
CREATE TABLE `user_list` (
  `account` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `head_portrait` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user_list
-- ----------------------------
INSERT INTO `user_list` VALUES ('a', '1', '/uploadImgs/1576132070540c.png');
INSERT INTO `user_list` VALUES ('b', '2', '/uploadImgs/1575878901422a.png');
