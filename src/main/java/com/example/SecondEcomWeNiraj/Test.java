package com.example.SecondEcomWeNiraj;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class Test {

	public static void main(String args[]) {

//		List<Integer> list = Arrays.asList(1,3,45,6,23,3,3,1,1,1,2,2);
//		
//		Map<Integer,Long> maps = list.stream().collect(Collectors.groupingBy(e->e,Collectors.counting()));
//	
//		System.out.println(maps);
//
//		
//		for(Entry<Integer,Long> map : maps.entrySet()) {
//
//			if(map.getValue() > 1) {
//				System.out.println(map.getKey());
//			}
//			
//		}
		int count = 0;
		String s = "hello Java World";

		char ch[] = s.toCharArray();

		Map<Character, Integer> map = new HashMap<>();

		for (int i = 0; i < ch.length; i++) {
			if (ch[i] != ' ') {
				if (map.containsKey(ch[i])) {
					map.put(ch[i], map.get(ch[i]) + 1);
				} else {
					map.put(ch[i], 1);
				}
			}
		}
		System.out.println("MAp  == " + map);
		for (Entry<Character, Integer> value : map.entrySet()) {
			if (value.getValue() > 1) {
				System.out.println(value.getKey());
			}

		}

	}
}
