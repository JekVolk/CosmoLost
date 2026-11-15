import { Badge, Box, type BoxProps, VStack } from '@chakra-ui/react';
import { Image as ImageIcon } from 'lucide-react';

export interface AssetPlaceholderProps extends BoxProps {
  label?: string;
  width?: string | number;
  height?: string | number;
}

export function AssetPlaceholder({
  label = 'Asset pending from develop',
  width = '100%',
  height = '140px',
  ...props
}: AssetPlaceholderProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="gray.600"
      borderRadius="md"
      bg="blackAlpha.300"
      p={4}
      width={width}
      height={height}
      {...props}
    >
      <VStack gap={2} align="center">
        <ImageIcon size={28} color="#718096" />
        <Badge variant="subtle" colorPalette="gray" fontSize="xs">
          {label}
        </Badge>
      </VStack>
    </Box>
  );
}
