


def files = [
        '/Users/alanger/Documents/GitHub/FGrav/src/test/resources/collapsed/left.collapsed',
        '/Users/alanger/Documents/GitHub/FGrav/src/test/resources/collapsed/right.collapsed',
        '/Users/alanger/Documents/GitHub/FGrav/src/test/resources/collapsed/diff2.collapsed',
        '/Users/alanger/Documents/GitHub/FGrav/src/test/resources/collapsed/blocking_calls.collapsed'
]


files.each { f ->
    
    Set occurences = [] as Set
    
    def out = new File(f + ".o")
    def count = 0
    
    
    new File(f).eachLine { l ->
    
        occurences.addAll(l.findAll(/com\/ebay\/[^;]+/))
        count++
    }

    Set packageNames = [] as Set

    occurences.each { path ->
        def p = path.findAll(/\/\w+/).findAll { s -> Character.isLetter(s.charAt(1)) }
        packageNames.addAll(p)
    }

    packageNames.remove('/ebay')

    int i= 0
    int u = 0
    
    Map p = packageNames.collectEntries { n -> (Character.isLowerCase(n.charAt(1))) ? [(n): value(i++)] : [(n): value(u++).toUpperCase()] }
    
    int x = 0
    
    out.withPrintWriter { w ->
    
        new File(f).eachLine { l ->
        
            p.each { k, v ->
                l = l.replaceAll(k, v)
            }
        
            w.println(l)
        
        
            println "$x of $count"
            x++
        }
    }
    
}

String value(int index) {
    int div = index / 26
    int mod = index % 26
    String p = (div > 0) ? ((div - 1 + 97) as char) : ''
    char c = (mod + 97) as char
    return "/$p$c"
}